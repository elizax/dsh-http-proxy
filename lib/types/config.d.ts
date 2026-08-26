/**
 * Configuration schema and validation for `dsh-http-proxy`.
 * @module dsh-http-proxy/config
 */
import z from '@deepseek-ai/schemastery';
/** Proxy URL schemes `undici`'s `ProxyAgent` accepts. */
export declare const SUPPORTED_PROXY_SCHEMES: readonly string[];
/** Configuration for the `dsh-http-proxy` plugin. */
export interface Config {
    /**
     * Proxy URL. Empty means the plugin is inactive and no request is routed.
     * Supported schemes: `http:`, `https:`, `socks4:`, `socks4a:`, `socks5:`,
     * `socks5h:`.
     */
    proxy: string;
    /**
     * Extra model-API hostnames to route through the proxy. `api.deepseek.com`
     * (and `DEEPSEEK_BASE_URL`, when set) are always included; list your custom
     * gateway hosts here. Requests to any other host keep the direct path.
     */
    proxyHosts: string[];
}
/** Runtime schema for {@link Config}. */
export declare const Config: z<Config>;
/**
 * Reject a proxy URL this plugin cannot serve. Registered as the settings
 * namespace validator so a bad URL is refused where it is written.
 * @param config - the resolved section to check.
 * @throws Error naming the offending proxy URL.
 */
export declare function assertValid(config: Config): void;
//# sourceMappingURL=config.d.ts.map