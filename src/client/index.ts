/**
 * Client half of dsh-http-proxy: registers the `http-proxy` settings card in
 * the DSH Settings → 插件配置 tab. The Host half (src/index.ts) registers the
 * same `http-proxy` namespace; the tab pairs the two without learning what the
 * namespace means.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the settings shell's ctx.settingsScope Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the ctx.slots Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { HttpProxyCard } from './card.js'
import { HttpProxyCardController } from './card-controller.js'

/** Settings namespace the Host half owns; keep in sync with src/index.ts. */
const NS = 'http-proxy'

/** The `llm-pi-ai` namespace, read-only here, supplying gateway hostname suggestions. */
const PI_AI_NS = 'llm-pi-ai'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'settingsScope']

/**
 * Mount the http-proxy settings card.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const controller = new HttpProxyCardController(
    ctx.settingsScope.bind({ namespace: NS }),
    ctx.settingsScope.bind({ namespace: PI_AI_NS }),
  )
  // Unsubscribe both scopes when this fiber disposes (unload / HMR), so the
  // orphaned controller cannot keep publishing after the card is gone.
  ctx.effect(() => () => controller.dispose())
  ctx.slots.inject('settings.plugin.item', function* () {
    yield ctx.slots.register({
      name: 'settings.plugin.item',
      key: NS,
      inject: () => controller.inject(),
    }, HttpProxyCard)
  })
}
