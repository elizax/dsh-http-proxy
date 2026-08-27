/**
 * Browser-safe hostname helpers shared by the Host half (routing) and the
 * browser card (suggestions). No node imports, so either bundle can inline
 * this module without dragging in `undici`.
 * @module dsh-http-proxy/hosts
 */

/** Extract the hostname from an absolute URL string or `URL`. */
export function hostnameOf(value: string | URL): string {
  return value instanceof URL ? value.hostname : new URL(value).hostname
}

/**
 * Normalize a user-entered host entry to a bare lowercase hostname, matching
 * what `shouldProxy` compares requests against (`new URL(url).hostname`).
 * Accepts a plain hostname, `host:port`, or an absolute URL (scheme, port, and
 * path are all stripped). Returns undefined when nothing usable remains.
 * @param entry - a raw `proxyHosts` / `excludeHosts` entry.
 * @returns the bare hostname, or undefined for an empty/invalid entry.
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
  const beforePath = trimmed.split('/')[0]
  const hostPart = beforePath?.split(':')[0]
  const bare = hostPart?.toLowerCase()
  return bare !== undefined && bare.length > 0 ? bare : undefined
}
