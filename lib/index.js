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
	proxyHosts: z.array(z.string()).default([]),
	excludeHosts: z.array(z.string()).default([])
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
//#region src/hosts.ts
/**
* Browser-safe hostname helpers shared by the Host half (routing) and the
* browser card (suggestions). No node imports, so either bundle can inline
* this module without dragging in `undici`.
* @module dsh-http-proxy/hosts
*/
/** Extract the hostname from an absolute URL string or `URL`. */
function hostnameOf(value) {
	return value instanceof URL ? value.hostname : new URL(value).hostname;
}
/**
* Normalize a user-entered host entry to a bare lowercase hostname, matching
* what `shouldProxy` compares requests against (`new URL(url).hostname`).
* Accepts a plain hostname, `host:port`, or an absolute URL (scheme, port, and
* path are all stripped). Returns undefined when nothing usable remains.
* @param entry - a raw `proxyHosts` / `excludeHosts` entry.
* @returns the bare hostname, or undefined for an empty/invalid entry.
*/
function normalizeHostEntry(entry) {
	const trimmed = entry.trim();
	if (trimmed.length === 0) return void 0;
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) try {
		return new URL(trimmed).hostname.toLowerCase();
	} catch {
		return;
	}
	const bare = (trimmed.split("/")[0]?.split(":")[0])?.toLowerCase();
	return bare !== void 0 && bare.length > 0 ? bare : void 0;
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
const NS = "http-proxy";
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
	const hosts = /* @__PURE__ */ new Set();
	if (config.proxyHosts.length > 0) for (const host of config.proxyHosts) {
		const normalized = normalizeHostEntry(host);
		if (normalized !== void 0) hosts.add(normalized);
	}
	else {
		hosts.add(DEFAULT_DEEPSEEK_HOST);
		const deepseekBase = process.env.DEEPSEEK_BASE_URL;
		if (deepseekBase !== void 0 && deepseekBase.length > 0) try {
			hosts.add(hostnameOf(deepseekBase));
		} catch {}
		const section = ctx.get("settings")?.get?.("llm-pi-ai");
		for (const profile of Object.values(section?.providers ?? {})) {
			const baseURL = profile.baseURL;
			if (baseURL !== void 0 && baseURL.length > 0) try {
				hosts.add(hostnameOf(baseURL));
			} catch {}
		}
	}
	for (const host of config.excludeHosts) {
		const normalized = normalizeHostEntry(host);
		if (normalized !== void 0) hosts.delete(normalized);
	}
	return hosts;
}
/** Whether two hostname sets hold the same hosts (sets are small; order-free compare). */
function sameHostSet(left, right) {
	if (left.size !== right.size) return false;
	for (const host of left) if (!right.has(host)) return false;
	return true;
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
	/** The active routing wrapper plus the config it was built from. */
	let active;
	let disposed = false;
	const deactivate = () => {
		if (active === void 0) return;
		globalThis.fetch = originalFetch;
		const entry = active.entry;
		active = void 0;
		entry.close().catch(() => {});
	};
	const refresh = () => {
		if (disposed) return;
		const cfg = current();
		const proxyUrl = cfg.proxy.length > 0 ? cfg.proxy : process.env.DSH_HTTP_PROXY ?? "";
		if (proxyUrl.length === 0) {
			deactivate();
			return;
		}
		const hosts = collectProxyHosts(ctx, cfg);
		if (active !== void 0 && active.proxyUrl === proxyUrl && sameHostSet(active.hosts, hosts)) return;
		let entry;
		try {
			assertValid({
				proxy: proxyUrl,
				proxyHosts: cfg.proxyHosts,
				excludeHosts: cfg.excludeHosts
			});
			entry = createProxyFetch(proxyUrl);
		} catch (cause) {
			ctx.logger.warn("http-proxy: invalid proxy URL \"%s\" (%s); routing stays off", proxyUrl, cause instanceof Error ? cause.message : String(cause));
			deactivate();
			return;
		}
		const next = {
			proxyUrl,
			hosts,
			entry
		};
		const previous = active;
		active = next;
		globalThis.fetch = createRoutingFetch(entry.fetch, originalFetch, hosts);
		if (previous !== void 0) previous.entry.close().catch(() => {});
	};
	refresh();
	ctx.effect(() => () => {
		disposed = true;
		deactivate();
	});
	ctx.on("settings/updated", (ns) => {
		if (String(ns) === "llm-pi-ai") refresh();
	});
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.installSection(ctx, NS, Config, config, {
			setSource: (source) => {
				current = source;
			},
			onChange: refresh,
			validate: assertValid
		});
	});
}
//#endregion
export { Config, SUPPORTED_PROXY_SCHEMES, apply, assertValid, createProxyFetch, createRoutingFetch, hostnameOf, name, normalizeHostEntry, shouldProxy, urlOf };
