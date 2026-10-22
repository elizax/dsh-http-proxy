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
     * Hostnames routed through the proxy. Empty means "auto-detect all model-API
     * hosts" (`api.deepseek.com`, `DEEPSEEK_BASE_URL`, and every `llm-pi-ai`
     * gateway `baseURL`); non-empty means route ONLY these hosts, ignoring
     * auto-detection.
     */
    proxyHosts: string[];
    /** Hostnames that must never be routed, even when auto-detected or listed. */
    excludeHosts: string[];
}
/**
 * A live config reference the loader keeps updating in place after volatile
 * writes (0.1.7), or the plain resolved value on hosts without that feature.
 */
type VolatileLike<T> = {
    get(): T;
};
/** Resolve a field that may be a plain value or a live volatile reference. */
export declare function resolveVolatile<T>(value: T | VolatileLike<T>): T;
/**
 * Runtime schema for {@link Config}. The annotation stays loose: `.volatile()`
 * (0.1.7 live-config references) widens the field types past what `z<Config>`
 * accepts under `exactOptionalPropertyTypes`, while `assertValid` below and
 * the apply() consumer both operate on resolved plain values.
 */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    proxy: z<string, string, "volatile-defined">;
    proxyHosts: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    excludeHosts: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    proxy: z<string, string, "volatile-defined">;
    proxyHosts: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    excludeHosts: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
}>>, "plain">;
/**
 * Reject a proxy URL this plugin cannot serve. Registered as the settings
 * namespace validator so a bad URL is refused where it is written.
 * @param config - the resolved section to check.
 * @throws Error naming the offending proxy URL.
 */
export declare function assertValid(config: Config): void;
export {};
//# sourceMappingURL=config.d.ts.map