/**
 * Browser-safe hostname helpers shared by the Host half (routing) and the
 * browser card (suggestions). No node imports, so either bundle can inline
 * this module without dragging in `undici`.
 * @module dsh-http-proxy/hosts
 */

/** The official DeepSeek adapter's default endpoint host. */
export const DEFAULT_DEEPSEEK_HOST = 'api.deepseek.com'

/**
 * Default model-API hostnames pi-ai's built-in providers use, so auto mode
 * proxies a catalog route (e.g. `google`) even when its profile names no
 * `baseURL`. Exact hostname matches; see {@link DEFAULT_MODEL_HOST_SUFFIXES}
 * for region- or resource-templated endpoints. This mirrors the endpoints the
 * installed pi-ai catalog ships (`builtinProviders()`); a pi-ai release that
 * adds a provider with a new default endpoint needs its host added here.
 */
export const DEFAULT_MODEL_HOSTS: readonly string[] = [
  'ai-gateway.vercel.sh',
  'api.ant-ling.com',
  'api.anthropic.com',
  'api.cerebras.ai',
  'api.cloudflare.com',
  'api.fireworks.ai',
  'api.groq.com',
  'api.individual.githubcopilot.com',
  'api.kimi.com',
  'api.minimaxi.com',
  'api.minimax.io',
  'api.mistral.ai',
  'api.moonshot.ai',
  'api.moonshot.cn',
  'api.openai.com',
  'api.together.ai',
  'api.x.ai',
  'api.xiaomimimo.com',
  'api.z.ai',
  'chatgpt.com',
  'gateway.ai.cloudflare.com',
  'generativelanguage.googleapis.com',
  'inference.baseten.co',
  'integrate.api.nvidia.com',
  'open.bigmodel.cn',
  'openrouter.ai',
  'router.huggingface.co',
  'token-plan-ams.xiaomimimo.com',
  'token-plan-cn.xiaomimimo.com',
  'token-plan-sgp.xiaomimimo.com',
  'token-plan.ap-southeast-1.maas.aliyuncs.com',
  'token-plan.cn-beijing.maas.aliyuncs.com',
]

/**
 * Default suffixes for templated pi-ai endpoints: `google-vertex` resolves its
 * catalog baseURL from `https://{location}-aiplatform.googleapis.com` (the
 * actual request lands on `us-central1-aiplatform.googleapis.com` and
 * siblings), and `azure-openai-responses` builds
 * `https://{resource}.openai.azure.com`. A suffix entry matches the bare
 * domain, its subdomains, and its hyphen-joined region hosts.
 */
export const DEFAULT_MODEL_HOST_SUFFIXES: readonly string[] = [
  '.aiplatform.googleapis.com',
  '.openai.azure.com',
]

/**
 * Extract the hostname from an absolute URL string or `URL`.
 * @param value - the URL to read.
 * @returns the lowercase hostname.
 */
export function hostnameOf(value: string | URL): string {
  return value instanceof URL ? value.hostname : new URL(value).hostname
}

/** Count one-character occurrences; enough for the `:` scan below. */
function countOf(value: string, needle: string): number {
  let count = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === needle) count++
  }
  return count
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
export function normalizeHostEntry(entry: string): string | undefined {
  const trimmed = entry.trim()
  if (trimmed.length === 0) return undefined
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).hostname.toLowerCase()
    } catch {
      return undefined
    }
  }
  const beforePath = trimmed.split('/')[0] ?? ''
  let hostPart: string
  if (beforePath.startsWith('[')) {
    // A bracketed IPv6 literal; a `:port` may follow the bracket.
    const close = beforePath.indexOf(']')
    hostPart = close === -1 ? beforePath : beforePath.slice(0, close + 1)
  } else if (countOf(beforePath, ':') === 1) {
    // Exactly one colon reads as `host:port`; a bare IPv6 literal has several.
    hostPart = beforePath.split(':')[0] ?? ''
  } else {
    hostPart = beforePath
  }
  let bare = hostPart.toLowerCase()
  if (bare.length === 0) return undefined
  // Bare IPv6 literals take the bracketed form URL hostnames carry.
  if (bare.includes(':') && !bare.startsWith('[')) bare = `[${bare}]`
  // `*.example.com` and `.example.com` are the same suffix entry.
  if (bare.startsWith('*.')) bare = bare.slice(1)
  // URL hostnames never carry a trailing dot; drop it so the entry matches.
  if (bare.endsWith('.')) bare = bare.slice(0, -1)
  return bare.length > 0 ? bare : undefined
}
