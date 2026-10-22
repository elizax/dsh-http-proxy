/**
 * Minimal local declarations for the DSH 0.1.7 client settings surfaces this
 * plugin consumes. The checked-in devDependencies still resolve the 0.1.2
 * type tree, which predates the `configForms` service; rather than bumping
 * the whole dev tree (and its lockfile churn in the eventual upstream PR),
 * these mirror the shapes published by
 * @deepseek-ai/dsh-client-ui-settings@0.1.7-rc.2
 * (lib/types/client/config-form*.d.ts) — types only; the host provides the
 * real implementations at runtime.
 */

/** Client-side sync state of one settings namespace (0.1.7). */
export interface ConfigFormSnapshot<T> {
  /** `loading` until the first accepted section; `unavailable` when not served. */
  status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted schema-resolved section; undefined before the first acceptance. */
  value: T | undefined
  /** Namespace revision fencing the next write. */
  revision: number | undefined
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** `host` syncs with the Host document; `memory` keeps a remote browser process-local. */
  mode: 'host' | 'memory'
}

/** Accepted values and serialized writes shared by editors of one Host entry (0.1.7). */
export interface ConfigForm<T> {
  /** @returns the current sync snapshot (stable reference until the next change). */
  getSnapshot(): ConfigFormSnapshot<T>
  /**
   * Observe snapshot replacements.
   * @param listener - invoked after each snapshot change.
   * @returns the disposer removing this listener.
   */
  subscribe(listener: () => void): () => void
  /**
   * Queue one field write; carries the latest known namespace revision.
   * @param field - scalar field inside the namespace section.
   * @param value - JSON-shaped value selected by the user.
   * @returns true for Host acceptance; transport failures reject.
   */
  set(field: string, value: unknown): Promise<boolean>
  /**
   * Queue one field clear, so the field re-inherits the composition layer.
   * @param field - scalar field inside the namespace section.
   * @returns true for Host acceptance; transport failures reject.
   */
  unset(field: string): Promise<boolean>
}

/** Shared entry forms over the Host configuration mirror (0.1.7 service). */
export interface ConfigForms {
  /**
   * Resolve one Host plugin entry's shared form.
   * @param entryId - unique Host plugin entry id (the settings namespace).
   */
  get<T>(entryId: string): ConfigForm<T>
}
