/**
 * The `settings.plugins.tab` slot type for the http-proxy tab — mirrors the
 * declaration in the DSH settings shell so this package can type its own tab
 * registration without importing that package's value (client purity gate).
 *
 * 0.1.7 migration: the keyed `settings.plugin.item` slot was removed from the
 * upstream catalog; a plugin settings surface is now one list entry of the
 * Plugins settings section, mounted as its own tab panel.
 */

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.plugins.tab': { kind: 'list'; scope: 'root'; owner: HttpProxyCardOwnerProps }
  }
}

/** Owner share of the http-proxy tab (the settings shell supplies nothing). */
export interface HttpProxyCardOwnerProps {
  children?: never
}
