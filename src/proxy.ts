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

import { ProxyAgent, fetch as undiciFetch } from 'undici'

/** Extract the hostname from an absolute URL string or `URL`. */
export function hostnameOf(value: string | URL): string {
  return value instanceof URL ? value.hostname : new URL(value).hostname
}

/** Extract the absolute URL string from a `fetch` input. */
export function urlOf(input: string | URL | Request): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/** Whether a URL's hostname is in the proxied set. Malformed URLs are never proxied. */
export function shouldProxy(url: string, hosts: ReadonlySet<string>): boolean {
  try {
    return hosts.has(new URL(url).hostname)
  } catch {
    return false
  }
}

/** A proxy dispatcher plus a `fetch` bound to it, for teardown. */
export interface ProxyFetch {
  /** Fetch that routes every request through the proxy. */
  fetch: typeof fetch
  /** Close the proxy dispatcher's idle connections. */
  close(): Promise<void>
}

/**
 * Create a fetch bound to a proxy dispatcher. `undici`'s `ProxyAgent` accepts
 * `http:`, `https:`, `socks4:`, `socks4a:`, `socks5:`, and `socks5h:` proxy URLs.
 * @param proxyUrl - the proxy endpoint.
 * @returns the proxy-bound fetch and its dispatcher closer.
 */
export function createProxyFetch(proxyUrl: string): ProxyFetch {
  const dispatcher = new ProxyAgent(proxyUrl)
  // undici's `fetch` and its `Request`/`RequestInit` types are nominally
  // distinct from the platform fetch types, but share the same runtime shape;
  // these casts are the whole boundary between the two views.
  const fetchImpl = ((input: RequestInfo | URL, init?: RequestInit) =>
    undiciFetch(
      input as unknown as Parameters<typeof undiciFetch>[0],
      { ...init, dispatcher } as unknown as Parameters<typeof undiciFetch>[1],
    )) as unknown as typeof fetch
  return {
    fetch: fetchImpl,
    close: () => dispatcher.close(),
  }
}

/**
 * Wrap a platform fetch so that requests to `hosts` travel through
 * `proxyFetch` and everything else keeps the original fetch.
 * @param proxyFetch - the proxy-bound fetch.
 * @param original - the fetch to keep for non-proxied hosts.
 * @param hosts - hostnames routed through the proxy.
 * @returns the routing fetch.
 */
export function createRoutingFetch(
  proxyFetch: typeof fetch,
  original: typeof fetch,
  hosts: ReadonlySet<string>,
): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input as string | URL | Request)
    return shouldProxy(url, hosts) ? proxyFetch(input, init) : original(input, init)
  }) as typeof fetch
}
