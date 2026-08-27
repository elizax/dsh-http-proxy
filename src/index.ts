/**
 * `dsh-http-proxy`: route model-API requests through an HTTP/SOCKS proxy
 * without modifying DeepSeek Harness source. It wraps `globalThis.fetch` —
 * the transport both the DeepSeek adapter and the pi-ai SDK clients use — and
 * sends only model-API hosts through a proxy dispatcher. Web search, web
 * fetch, MCP, and every other host keep the direct path.
 *
 * @module dsh-http-proxy
 */

import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { assertValid, Config } from './config.js'
import type { Config as PluginConfig } from './config.js'
import { createProxyFetch, createRoutingFetch, hostnameOf, normalizeHostEntry } from './proxy.js'
import type { ProxyFetch } from './proxy.js'

export { Config, assertValid, SUPPORTED_PROXY_SCHEMES } from './config.js'
export type { Config as PluginConfig } from './config.js'
export { createProxyFetch, createRoutingFetch, hostnameOf, normalizeHostEntry, shouldProxy, urlOf } from './proxy.js'
export type { ProxyFetch } from './proxy.js'

/** Plugin short name (also its settings namespace). */
export const name = 'http-proxy'

const NS = settingsNamespace('http-proxy')

/** The official DeepSeek adapter's default endpoint host. */
const DEFAULT_DEEPSEEK_HOST = 'api.deepseek.com'

/** A settings section, read optionally at request time. */
interface SettingsLike {
  get?: (ns: string) => unknown
}

/** A resolved `llm-pi-ai` section's provider profile subset. */
interface PiAiSection {
  providers?: Record<string, { baseURL?: string }>
}

/**
 * Collect the hostnames that should travel through the proxy: the official
 * DeepSeek host (or `DEEPSEEK_BASE_URL`), the configured `proxyHosts`, and the
 * custom model gateways declared in the `llm-pi-ai` settings section.
 * @param ctx - the Cordis context, for the optional settings service.
 * @param config - the plugin config.
 * @returns the proxied hostname set.
 */
function collectProxyHosts(ctx: Context, config: PluginConfig): Set<string> {
  const hosts = new Set<string>()
  if (config.proxyHosts.length > 0) {
    // Explicit mode: only the listed hosts are proxied. Entries are normalized
    // to bare lowercase hostnames so mixed case, `host:port`, or pasted URLs
    // still match the hostname `shouldProxy` compares requests against.
    for (const host of config.proxyHosts) {
      const normalized = normalizeHostEntry(host)
      if (normalized !== undefined) hosts.add(normalized)
    }
  } else {
    // Auto mode: every model-API host DSH knows about.
    hosts.add(DEFAULT_DEEPSEEK_HOST)
    const deepseekBase = process.env.DEEPSEEK_BASE_URL
    if (deepseekBase !== undefined && deepseekBase.length > 0) {
      try {
        hosts.add(hostnameOf(deepseekBase))
      } catch {
        // A malformed base URL is the adapter's to reject, not this plugin's.
      }
    }
    const settings = ctx.get('settings') as SettingsLike | undefined
    const section = settings?.get?.('llm-pi-ai') as PiAiSection | undefined
    for (const profile of Object.values(section?.providers ?? {})) {
      const baseURL = profile.baseURL
      if (baseURL !== undefined && baseURL.length > 0) {
        try {
          hosts.add(hostnameOf(baseURL))
        } catch {
          // Same as above: configuration errors surface where they are written.
        }
      }
    }
  }
  // Exclusions always win, in either mode — normalized the same way.
  for (const host of config.excludeHosts) {
    const normalized = normalizeHostEntry(host)
    if (normalized !== undefined) hosts.delete(normalized)
  }
  return hosts
}

/** Whether two hostname sets hold the same hosts (sets are small; order-free compare). */
function sameHostSet(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size !== right.size) return false
  for (const host of left) {
    if (!right.has(host)) return false
  }
  return true
}

/**
 * Install the routing wrapper. The plugin reads its config per refresh, so a
 * settings change reaches the next request without a restart; an empty `proxy`
 * deactivates routing and restores the platform fetch.
 * @param ctx - the Cordis context this plugin mounts into.
 * @param config - composition entry config; the `base` layer under user settings.
 */
export function apply(ctx: Context, config: PluginConfig): void {
  let current: () => PluginConfig = () => config
  const originalFetch = globalThis.fetch
  /** The active routing wrapper plus the config it was built from. */
  let active: { proxyUrl: string; hosts: Set<string>; entry: ProxyFetch } | undefined
  let disposed = false

  const deactivate = (): void => {
    if (active === undefined) return
    // Restore the platform fetch first, so no request can land on a closing
    // dispatcher after this point.
    globalThis.fetch = originalFetch
    const entry = active.entry
    active = undefined
    void entry.close().catch(() => { /* a closed dispatcher is the goal */ })
  }

  const refresh = (): void => {
    if (disposed) return
    const cfg = current()
    // Settings `proxy` wins; the `DSH_HTTP_PROXY` environment variable is the
    // no-file fallback so a deployment can set the proxy without editing settings.
    const proxyUrl = cfg.proxy.length > 0 ? cfg.proxy : (process.env.DSH_HTTP_PROXY ?? '')
    if (proxyUrl.length === 0) {
      deactivate()
      return
    }
    const hosts = collectProxyHosts(ctx, cfg)
    // No config actually moved: keep the current dispatcher and wrapper, so an
    // unrelated settings save never tears down in-flight proxy connections.
    if (active !== undefined && active.proxyUrl === proxyUrl && sameHostSet(active.hosts, hosts)) return
    let entry: ProxyFetch
    try {
      // `assertValid` guards the settings write path, but the `DSH_HTTP_PROXY`
      // fallback bypasses it — judge the resolved URL here too, so a bad value
      // degrades to "routing off" instead of failing the plugin mount.
      assertValid({ proxy: proxyUrl, proxyHosts: cfg.proxyHosts, excludeHosts: cfg.excludeHosts })
      entry = createProxyFetch(proxyUrl)
    } catch (cause) {
      ctx.logger.warn(
        'http-proxy: invalid proxy URL "%s" (%s); routing stays off',
        proxyUrl,
        cause instanceof Error ? cause.message : String(cause),
      )
      deactivate()
      return
    }
    const next = { proxyUrl, hosts, entry }
    const previous = active
    active = next
    globalThis.fetch = createRoutingFetch(entry.fetch, originalFetch, hosts)
    // Publish the new wrapper before closing the old dispatcher, so requests
    // started after this point always land on the live dispatcher.
    if (previous !== undefined) {
      void previous.entry.close().catch(() => { /* replaced by a newer wrapper */ })
    }
  }

  refresh()
  ctx.effect(() => () => {
    disposed = true
    deactivate()
  })

  // The proxied host set depends on the `llm-pi-ai` gateways, which this
  // plugin does not own. Recompute on any committed settings change so a new
  // or renamed gateway is proxied without a restart (no-op when nothing moved).
  ctx.on('settings/updated', (ns: unknown) => {
    if (String(ns) === 'llm-pi-ai') refresh()
  })

  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => {
      current = source
    },
    onChange: refresh,
    validate: assertValid,
  })
}
