import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import { ProxyAgent, fetch } from "undici";
//#region src/config.ts
/**
* Configuration schema and validation for `dsh-http-proxy`.
* @module dsh-http-proxy/config
*/
/** Proxy URL schemes `undici`'s `ProxyAgent` accepts. */
const SUPPORTED_PROXY_SCHEMES = [
	"http",
	"https",
	"socks4",
	"socks4a",
	"socks5",
	"socks5h"
];
/** Runtime schema for {@link Config}. */
const Config = z.object({
	proxy: z.string().default(""),
	proxyHosts: z.array(z.string()).default([])
});
/**
* Reject a proxy URL this plugin cannot serve. Registered as the settings
* namespace validator so a bad URL is refused where it is written.
* @param config - the resolved section to check.
* @throws Error naming the offending proxy URL.
*/
function assertValid(config) {
	if (config.proxy.length === 0) return;
	let parsed;
	try {
		parsed = new URL(config.proxy);
	} catch {
		throw new Error(`http-proxy: invalid proxy URL "${config.proxy}"`);
	}
	const scheme = parsed.protocol.replace(/:$/, "");
	if (!SUPPORTED_PROXY_SCHEMES.includes(scheme)) throw new Error(`http-proxy: proxy URL "${config.proxy}" uses unsupported scheme "${parsed.protocol}"; supported schemes: ${SUPPORTED_PROXY_SCHEMES.join(", ")}`);
}
//#endregion
//#region src/proxy.ts
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
/** Extract the hostname from an absolute URL string or `URL`. */
function hostnameOf(value) {
	return value instanceof URL ? value.hostname : new URL(value).hostname;
}
/** Extract the absolute URL string from a `fetch` input. */
function urlOf(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.href;
	return input.url;
}
/** Whether a URL's hostname is in the proxied set. Malformed URLs are never proxied. */
function shouldProxy(url, hosts) {
	try {
		return hosts.has(new URL(url).hostname);
	} catch {
		return false;
	}
}
/**
* Create a fetch bound to a proxy dispatcher. `undici`'s `ProxyAgent` accepts
* `http:`, `https:`, `socks4:`, `socks4a:`, `socks5:`, and `socks5h:` proxy URLs.
* @param proxyUrl - the proxy endpoint.
* @returns the proxy-bound fetch and its dispatcher closer.
*/
function createProxyFetch(proxyUrl) {
	const dispatcher = new ProxyAgent(proxyUrl);
	const fetchImpl = ((input, init) => fetch(input, {
		...init,
		dispatcher
	}));
	return {
		fetch: fetchImpl,
		close: () => dispatcher.close()
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
function createRoutingFetch(proxyFetch, original, hosts) {
	return ((input, init) => {
		return shouldProxy(urlOf(input), hosts) ? proxyFetch(input, init) : original(input, init);
	});
}
//#endregion
//#region src/index.ts
/** Plugin short name (also its settings namespace). */
const name = "http-proxy";
const NS = settingsNamespace("http-proxy");
/** The official DeepSeek adapter's default endpoint host. */
const DEFAULT_DEEPSEEK_HOST = "api.deepseek.com";
/**
* Collect the hostnames that should travel through the proxy: the official
* DeepSeek host (or `DEEPSEEK_BASE_URL`), the configured `proxyHosts`, and the
* custom model gateways declared in the `llm-pi-ai` settings section.
* @param ctx - the Cordis context, for the optional settings service.
* @param config - the plugin config.
* @returns the proxied hostname set.
*/
function collectProxyHosts(ctx, config) {
	const hosts = /* @__PURE__ */ new Set([DEFAULT_DEEPSEEK_HOST]);
	const deepseekBase = process.env.DEEPSEEK_BASE_URL;
	if (deepseekBase !== void 0 && deepseekBase.length > 0) try {
		hosts.add(hostnameOf(deepseekBase));
	} catch {}
	for (const host of config.proxyHosts) if (host.length > 0) hosts.add(host);
	const section = ctx.get("settings")?.get?.("llm-pi-ai");
	for (const profile of Object.values(section?.providers ?? {})) {
		const baseURL = profile.baseURL;
		if (baseURL !== void 0 && baseURL.length > 0) try {
			hosts.add(hostnameOf(baseURL));
		} catch {}
	}
	return hosts;
}
/**
* Install the routing wrapper. The plugin reads its config per refresh, so a
* settings change reaches the next request without a restart; an empty `proxy`
* deactivates routing and restores the platform fetch.
* @param ctx - the Cordis context this plugin mounts into.
* @param config - composition entry config; the `base` layer under user settings.
*/
function apply(ctx, config) {
	let current = () => config;
	const originalFetch = globalThis.fetch;
	let active;
	const deactivate = () => {
		if (active === void 0) return;
		globalThis.fetch = originalFetch;
		const entry = active;
		active = void 0;
		entry.close();
	};
	const refresh = () => {
		const cfg = current();
		const proxyUrl = cfg.proxy.length > 0 ? cfg.proxy : process.env.DSH_HTTP_PROXY ?? "";
		if (proxyUrl.length === 0) {
			deactivate();
			return;
		}
		if (active !== void 0) {
			const previous = active;
			active = void 0;
			previous.close();
		}
		const hosts = collectProxyHosts(ctx, cfg);
		const entry = createProxyFetch(proxyUrl);
		active = entry;
		globalThis.fetch = createRoutingFetch(entry.fetch, originalFetch, hosts);
	};
	refresh();
	ctx.effect(() => () => deactivate());
	installSettingsSection(ctx, NS, Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: refresh,
		validate: assertValid
	});
}
//#endregion
export { Config, SUPPORTED_PROXY_SCHEMES, apply, assertValid, createProxyFetch, createRoutingFetch, hostnameOf, name, shouldProxy, urlOf };
