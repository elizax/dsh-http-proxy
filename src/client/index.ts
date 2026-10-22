/**
 * Client half of dsh-http-proxy: registers the `http-proxy` settings tab in
 * the DSH Settings → Plugins section. The Host half (src/index.ts) owns the
 * same `http-proxy` namespace; the tab pairs the two without learning what the
 * namespace means.
 *
 * 0.1.7 migration: the `settingsScope` service was removed upstream and this
 * module's inject of it left the browser fiber pending forever ("waiting for
 * service: settingsScope"), blocking the whole Web boot. The replacement face
 * is the settings provider's shared `configForms` service: one
 * `ConfigForm<T>` per namespace with getSnapshot/subscribe/set/unset.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the settings provider's shared-forms Context merge (0.1.7
// provides ctx.configForms; the local 0.1.2 dev type tree predates it, so the
// consumer below reaches it through a narrow structural cast).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the ctx.slots Context merge (renderer-owned since 0.1.2).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { ConfigForm, ConfigForms } from './settings-forms-017.js'
import { HttpProxyCard } from './card.js'
import { HttpProxyCardController } from './card-controller.js'

/** Settings namespace the Host half owns; keep in sync with src/index.ts. */
const NS = 'http-proxy'

/** The `llm-pi-ai` namespace, read-only here, supplying gateway hostname suggestions. */
const PI_AI_NS = 'llm-pi-ai'

/** The `http-proxy` section fields this tab edits (mirror of the Host Config). */
interface HttpProxySettings {
  /** Proxy URL (http/https/socks4/socks4a/socks5/socks5h); empty = inactive. */
  proxy?: string
  /** Hostnames to proxy (empty = auto-detect every model host). */
  proxyHosts?: string[]
  /** Hostnames never proxied. */
  excludeHosts?: string[]
}

/** The `llm-pi-ai` section subset this tab reads for known model gateways. */
interface PiAiSettings {
  providers?: Record<string, { baseURL?: string }>
}

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'configForms']

/**
 * Mount the http-proxy settings tab.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const forms = (ctx as unknown as { configForms: ConfigForms }).configForms
  const controller = new HttpProxyCardController(
    forms.get<HttpProxySettings>(NS),
    forms.get<PiAiSettings>(PI_AI_NS),
  )
  // Unsubscribe both forms when this fiber disposes (unload / HMR), so the
  // orphaned controller cannot keep publishing after the tab is gone.
  ctx.effect(() => () => controller.dispose())
  ctx.slots.inject('settings.plugins.tab', function* () {
    yield ctx.slots.register({
      name: 'settings.plugins.tab',
      id: 'http-proxy',
      order: 100,
      label: 'HTTP 代理',
      inject: () => controller.inject(),
    }, HttpProxyCard)
  })
}
