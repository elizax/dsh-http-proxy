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
import { createProxyFetch, createRoutingFetch, hostnameOf } from './proxy.js'
import type { ProxyFetch } from './proxy.js'

export { Config, assertValid, SUPPORTED_PROXY_SCHEMES } from './config.js'
export type { Config as PluginConfig } from './config.js'
export { createProxyFetch, createRoutingFetch, hostnameOf, shouldProxy, urlOf } from './proxy.js'
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
  const hosts = new Set<string>([DEFAULT_DEEPSEEK_HOST])
  const deepseekBase = process.env.DEEPSEEK_BASE_URL
  if (deepseekBase !== undefined && deepseekBase.length > 0) {
    try {
      hosts.add(hostnameOf(deepseekBase))
    } catch {
      // A malformed base URL is the adapter's to reject, not this plugin's.
    }
  }
  for (const host of config.proxyHosts) {
    if (host.length > 0) hosts.add(host)
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
  return hosts
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
  let active: ProxyFetch | undefined

  const deactivate = (): void => {
    if (active === undefined) return
    globalThis.fetch = originalFetch
    const entry = active
    active = undefined
    void entry.close()
  }

  const refresh = (): void => {
    const cfg = current()
    if (cfg.proxy.length === 0) {
      deactivate()
      return
    }
    if (active !== undefined) {
      const previous = active
      active = undefined
      void previous.close()
    }
    const hosts = collectProxyHosts(ctx, cfg)
    const entry = createProxyFetch(cfg.proxy)
    active = entry
    globalThis.fetch = createRoutingFetch(entry.fetch, originalFetch, hosts)
  }

  refresh()
  ctx.effect(() => () => deactivate())

  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => {
      current = source
    },
    onChange: refresh,
    validate: assertValid,
  })
}
