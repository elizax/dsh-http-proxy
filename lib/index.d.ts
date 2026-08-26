/**
 * `dsh-http-proxy`: route model-API requests through an HTTP/SOCKS proxy
 * without modifying DeepSeek Harness source. It wraps `globalThis.fetch` —
 * the transport both the DeepSeek adapter and the pi-ai SDK clients use — and
 * sends only model-API hosts through a proxy dispatcher. Web search, web
 * fetch, MCP, and every other host keep the direct path.
 *
 * @module dsh-http-proxy
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Config as PluginConfig } from './config.js';
export { Config, assertValid, SUPPORTED_PROXY_SCHEMES } from './config.js';
export type { Config as PluginConfig } from './config.js';
export { createProxyFetch, createRoutingFetch, hostnameOf, shouldProxy, urlOf } from './proxy.js';
export type { ProxyFetch } from './proxy.js';
/** Plugin short name (also its settings namespace). */
export declare const name = "http-proxy";
/**
 * Install the routing wrapper. The plugin reads its config per refresh, so a
 * settings change reaches the next request without a restart; an empty `proxy`
 * deactivates routing and restores the platform fetch.
 * @param ctx - the Cordis context this plugin mounts into.
 * @param config - composition entry config; the `base` layer under user settings.
 */
export declare function apply(ctx: Context, config: PluginConfig): void;
//# sourceMappingURL=index.d.ts.map