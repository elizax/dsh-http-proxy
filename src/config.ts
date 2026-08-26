/**
 * Configuration schema and validation for `dsh-http-proxy`.
 * @module dsh-http-proxy/config
 */

import z from '@deepseek-ai/schemastery'

/** Proxy URL schemes `undici`'s `ProxyAgent` accepts. */
export const SUPPORTED_PROXY_SCHEMES: readonly string[] = [
  'http',
  'https',
  'socks4',
  'socks4a',
  'socks5',
  'socks5h',
]

/** Configuration for the `dsh-http-proxy` plugin. */
export interface Config {
  /**
   * Proxy URL. Empty means the plugin is inactive and no request is routed.
   * Supported schemes: `http:`, `https:`, `socks4:`, `socks4a:`, `socks5:`,
   * `socks5h:`.
   */
  proxy: string
  /**
   * Hostnames routed through the proxy. Empty means "auto-detect all model-API
   * hosts" (`api.deepseek.com`, `DEEPSEEK_BASE_URL`, and every `llm-pi-ai`
   * gateway `baseURL`); non-empty means route ONLY these hosts, ignoring
   * auto-detection.
   */
  proxyHosts: string[]
  /** Hostnames that must never be routed, even when auto-detected or listed. */
  excludeHosts: string[]
}

/** Runtime schema for {@link Config}. */
export const Config: z<Config> = z.object({
  proxy: z.string().default(''),
  proxyHosts: z.array(z.string()).default([]),
  excludeHosts: z.array(z.string()).default([]),
})

/**
 * Reject a proxy URL this plugin cannot serve. Registered as the settings
 * namespace validator so a bad URL is refused where it is written.
 * @param config - the resolved section to check.
 * @throws Error naming the offending proxy URL.
 */
export function assertValid(config: Config): void {
  if (config.proxy.length === 0) return
  let parsed: URL
  try {
    parsed = new URL(config.proxy)
  } catch {
    throw new Error(`http-proxy: invalid proxy URL "${config.proxy}"`)
  }
  const scheme = parsed.protocol.replace(/:$/, '')
  if (!SUPPORTED_PROXY_SCHEMES.includes(scheme)) {
    throw new Error(
      `http-proxy: proxy URL "${config.proxy}" uses unsupported scheme "${parsed.protocol}";`
      + ` supported schemes: ${SUPPORTED_PROXY_SCHEMES.join(', ')}`,
    )
  }
}
