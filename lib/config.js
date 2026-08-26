/**
 * Configuration schema and validation for `dsh-http-proxy`.
 * @module dsh-http-proxy/config
 */
import z from '@deepseek-ai/schemastery';
/** Proxy URL schemes `undici`'s `ProxyAgent` accepts. */
export const SUPPORTED_PROXY_SCHEMES = [
    'http',
    'https',
    'socks4',
    'socks4a',
    'socks5',
    'socks5h',
];
/** Runtime schema for {@link Config}. */
export const Config = z.object({
    proxy: z.string().default(''),
    proxyHosts: z.array(z.string()).default([]),
});
/**
 * Reject a proxy URL this plugin cannot serve. Registered as the settings
 * namespace validator so a bad URL is refused where it is written.
 * @param config - the resolved section to check.
 * @throws Error naming the offending proxy URL.
 */
export function assertValid(config) {
    if (config.proxy.length === 0)
        return;
    let parsed;
    try {
        parsed = new URL(config.proxy);
    }
    catch {
        throw new Error(`http-proxy: invalid proxy URL "${config.proxy}"`);
    }
    const scheme = parsed.protocol.replace(/:$/, '');
    if (!SUPPORTED_PROXY_SCHEMES.includes(scheme)) {
        throw new Error(`http-proxy: proxy URL "${config.proxy}" uses unsupported scheme "${parsed.protocol}";`
            + ` supported schemes: ${SUPPORTED_PROXY_SCHEMES.join(', ')}`);
    }
}
//# sourceMappingURL=config.js.map