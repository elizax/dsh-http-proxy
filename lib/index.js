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
/** The official DeepSeek adapter's default endpoint host. */
const DEFAULT_DEEPSEEK_HOST = "api.deepseek.com";
/**
* Default model-API hostnames pi-ai's built-in providers use, so auto mode
* proxies a catalog route (e.g. `google`) even when its profile names no
* `baseURL`. Exact hostname matches; see {@link DEFAULT_MODEL_HOST_SUFFIXES}
* for region- or resource-templated endpoints. This mirrors the endpoints the
* installed pi-ai catalog ships (`builtinProviders()`); a pi-ai release that
* adds a provider with a new default endpoint needs its host added here.
*/
const DEFAULT_MODEL_HOSTS = [
	"ai-gateway.vercel.sh",
	"api.ant-ling.com",
	"api.anthropic.com",
	"api.cerebras.ai",
	"api.cloudflare.com",
	"api.fireworks.ai",
	"api.groq.com",
	"api.individual.githubcopilot.com",
	"api.kimi.com",
	"api.minimaxi.com",
	"api.minimax.io",
	"api.mistral.ai",
	"api.moonshot.ai",
	"api.moonshot.cn",
	"api.openai.com",
	"api.together.ai",
	"api.x.ai",
	"api.xiaomimimo.com",
	"api.z.ai",
	"chatgpt.com",
	"gateway.ai.cloudflare.com",
	"generativelanguage.googleapis.com",
	"inference.baseten.co",
	"integrate.api.nvidia.com",
	"open.bigmodel.cn",
	"openrouter.ai",
	"router.huggingface.co",
	"token-plan-ams.xiaomimimo.com",
	"token-plan-cn.xiaomimimo.com",
	"token-plan-sgp.xiaomimimo.com",
	"token-plan.ap-southeast-1.maas.aliyuncs.com",
	"token-plan.cn-beijing.maas.aliyuncs.com"
];
/**
* Default suffixes for templated pi-ai endpoints: `google-vertex` resolves its
* catalog baseURL from `https://{location}-aiplatform.googleapis.com` (the
* actual request lands on `us-central1-aiplatform.googleapis.com` and
* siblings), and `azure-openai-responses` builds
* `https://{resource}.openai.azure.com`. A suffix entry matches the bare
* domain, its subdomains, and its hyphen-joined region hosts.
*/
const DEFAULT_MODEL_HOST_SUFFIXES = [".aiplatform.googleapis.com", ".openai.azure.com"];
/**
* Extract the hostname from an absolute URL string or `URL`.
* @param value - the URL to read.
* @returns the lowercase hostname.
*/
function hostnameOf(value) {
	return value instanceof URL ? value.hostname : new URL(value).hostname;
}
/** Count one-character occurrences; enough for the `:` scan below. */
function countOf(value, needle) {
	let count = 0;
	for (let i = 0; i < value.length; i++) if (value[i] === needle) count++;
	return count;
}
/**
* Normalize a user-entered host entry to the form `shouldProxy` matches
* against (`new URL(url).hostname`). Accepts a plain hostname, `host:port`,
* a bracketed or bare IPv6 literal, an absolute URL (scheme, port, and path
* are all stripped), or a suffix entry (`*.example.com` or `.example.com`,
* both kept as `.example.com`). Returns undefined when nothing usable
* remains.
* @param entry - a raw `proxyHosts` / `excludeHosts` entry.
* @returns the normalized entry, or undefined for an empty/invalid entry.
*/
function normalizeHostEntry(entry) {
	const trimmed = entry.trim();
	if (trimmed.length === 0) return void 0;
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) try {
		return new URL(trimmed).hostname.toLowerCase();
	} catch {
		return;
	}
	const beforePath = trimmed.split("/")[0] ?? "";
	let hostPart;
	if (beforePath.startsWith("[")) {
		const close = beforePath.indexOf("]");
		hostPart = close === -1 ? beforePath : beforePath.slice(0, close + 1);
	} else if (countOf(beforePath, ":") === 1) hostPart = beforePath.split(":")[0] ?? "";
	else hostPart = beforePath;
	let bare = hostPart.toLowerCase();
	if (bare.length === 0) return void 0;
	if (bare.includes(":") && !bare.startsWith("[")) bare = `[${bare}]`;
	if (bare.startsWith("*.")) bare = bare.slice(1);
	if (bare.endsWith(".")) bare = bare.slice(0, -1);
	return bare.length > 0 ? bare : void 0;
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
/**
* Whether a URL's hostname is in the proxied set. Entries are normalized
* hostnames; one starting with `.` is a suffix that matches the bare domain
* and every host built on it — a subdomain (`api.example.com`) or a
* hyphen-joined region host (`us-central1-aiplatform.googleapis.com`, the
* shape `google-vertex` builds from its `{location}` template). Malformed
* URLs are never proxied.
*/
function shouldProxy(url, hosts) {
	try {
		const hostname = new URL(url).hostname;
		if (hosts.has(hostname)) return true;
		for (const entry of hosts) {
			if (!entry.startsWith(".")) continue;
			const domain = entry.slice(1);
			if (hostname === domain || hostname.endsWith(`.${domain}`) || hostname.endsWith(`-${domain}`)) return true;
		}
		return false;
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
/**
* Collect the hostnames that should travel through the proxy: the official
* DeepSeek host (or `DEEPSEEK_BASE_URL`), the default endpoints of the
* built-in pi-ai providers (catalog routes configure no `baseURL` of their
* own), the configured `proxyHosts`, and the custom model gateways declared
* in the `llm-pi-ai` settings section.
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
		for (const host of DEFAULT_MODEL_HOSTS) hosts.add(host);
		for (const suffix of DEFAULT_MODEL_HOST_SUFFIXES) hosts.add(suffix);
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
export { Config, DEFAULT_DEEPSEEK_HOST, DEFAULT_MODEL_HOSTS, DEFAULT_MODEL_HOST_SUFFIXES, SUPPORTED_PROXY_SCHEMES, apply, assertValid, createProxyFetch, createRoutingFetch, hostnameOf, name, normalizeHostEntry, shouldProxy, urlOf };
