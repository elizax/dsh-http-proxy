/**
 * Proxy transport and host-routing helpers for `dsh-http-proxy`.
 *
 * The plugin does not touch DeepSeek Harness source. It installs a wrapper
 * around `globalThis.fetch` — which both the DeepSeek adapter's raw `fetch` and
 * the pi-ai SDK clients call — and routes only model-API hosts through a
 * proxy dispatcher, leaving every other host (web search, web fetch, MCP, …)
 * on the direct path.
 * @module dsh-http-proxy/proxy
 */
import { ProxyAgent, fetch as undiciFetch } from 'undici';
/** Extract the hostname from an absolute URL string or `URL`. */
export function hostnameOf(value) {
    return value instanceof URL ? value.hostname : new URL(value).hostname;
}
/** Extract the absolute URL string from a `fetch` input. */
export function urlOf(input) {
    if (typeof input === 'string')
        return input;
    if (input instanceof URL)
        return input.href;
    return input.url;
}
/** Whether a URL's hostname is in the proxied set. Malformed URLs are never proxied. */
export function shouldProxy(url, hosts) {
    try {
        return hosts.has(new URL(url).hostname);
    }
    catch {
        return false;
    }
}
/**
 * Create a fetch bound to a proxy dispatcher. `undici`'s `ProxyAgent` accepts
 * `http:`, `https:`, `socks4:`, `socks4a:`, `socks5:`, and `socks5h:` proxy URLs.
 * @param proxyUrl - the proxy endpoint.
 * @returns the proxy-bound fetch and its dispatcher closer.
 */
export function createProxyFetch(proxyUrl) {
    const dispatcher = new ProxyAgent(proxyUrl);
    // undici's `fetch` and its `Request`/`RequestInit` types are nominally
    // distinct from the platform fetch types, but share the same runtime shape;
    // these casts are the whole boundary between the two views.
    const fetchImpl = ((input, init) => undiciFetch(input, { ...init, dispatcher }));
    return {
        fetch: fetchImpl,
        close: () => dispatcher.close(),
    };
}
/**
 * Wrap a platform fetch so that requests to `hosts` travel through
 * `proxyFetch` and everything else keeps the original fetch.
 * @param proxyFetch - the proxy-bound fetch.
 * @param original - the fetch to keep for non-proxied hosts.
 * @param hosts - hostnames routed through the proxy.
 * @returns the routing fetch.
 */
export function createRoutingFetch(proxyFetch, original, hosts) {
    return ((input, init) => {
        const url = urlOf(input);
        return shouldProxy(url, hosts) ? proxyFetch(input, init) : original(input, init);
    });
}
//# sourceMappingURL=proxy.js.map