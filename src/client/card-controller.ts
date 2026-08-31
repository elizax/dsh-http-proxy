/**
 * The http-proxy settings card's staged form over the `http-proxy` namespace,
 * plus the read-only `llm-pi-ai` view that supplies the hostname suggestions
 * for the two host fields.
 *
 * A card stages what the user types and writes only on save, so a typed draft
 * never mutates the durable document before the user commits it. The Host's
 * validator remains the authority on what lands; a save that did not land keeps
 * its drafts so the user can correct them.
 */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { hostnameOf, normalizeHostEntry } from '../hosts.js'

/** The `http-proxy` section fields this card edits. */
export interface HttpProxySettings {
  /** Proxy URL (http/https/socks4/socks4a/socks5/socks5h); empty = inactive. */
  proxy?: string
  /** Hostnames to proxy (empty = auto-detect every model host). */
  proxyHosts?: string[]
  /** Hostnames never proxied. */
  excludeHosts?: string[]
}

/** The `llm-pi-ai` section subset this card reads for known model gateways. */
export interface PiAiSettings {
  providers?: Record<string, { baseURL?: string }>
}

/** One editable field of the card. */
type FieldName = 'proxy' | 'proxyHosts' | 'excludeHosts'

/** The official DeepSeek adapter's default endpoint host; keep in sync with src/index.ts. */
const DEFAULT_DEEPSEEK_HOST = 'api.deepseek.com'

/** What the http-proxy card renders. */
export interface HttpProxyCardState {
  /** False while the namespace is not served to this client. */
  available: boolean
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** Staged proxy URL. */
  proxy: string
  /** Staged proxy-only hosts, comma/space separated. */
  proxyHosts: string
  /** Staged excluded hosts, comma/space separated. */
  excludeHosts: string
  /** Known model hostnames offered by the host fields' dropdown (free text still allowed). */
  suggestions: string[]
  /** Whether the form holds edits a save would write. */
  dirty: boolean
  /** Whether a save is crossing the wire. */
  saving: boolean
  /** Whether the last save landed as staged. */
  saved: boolean
  /** Whether the last save did not land. */
  failed: boolean
}

/** The registration-side face the card's slot entry injects. */
export interface HttpProxyCardFace {
  /** Card snapshot bound by the renderer as useHttpProxyCard. */
  hooks: { httpProxyCard: SnapshotStore<HttpProxyCardState> }
  /** Stage draft text for one field. */
  edit: (field: FieldName, text: string) => void
  /** Write every staged edit. */
  save: () => void
}

/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
export class HttpProxyCardController {
  private readonly store: SnapshotStore<HttpProxyCardState>
  private readonly staged = new Map<FieldName, string>()
  private readonly disposers: Array<() => void> = []
  private saving = false
  private saved = false
  private failed = false

  /**
   * @param scope - the bound settings scope for the `http-proxy` namespace.
   * @param known - the bound read-only `llm-pi-ai` scope that supplies gateway hostnames.
   */
  constructor(
    private readonly scope: SettingsScope<HttpProxySettings>,
    private readonly known: SettingsScope<PiAiSettings>,
  ) {
    this.store = createSnapshotStore(this.projection())
    this.disposers.push(
      scope.subscribe(() => this.publish()),
      known.subscribe(() => this.publish()),
    )
  }

  /** Stop observing both scopes and drop the staged drafts. Idempotent. */
  dispose(): void {
    for (const disposer of this.disposers.splice(0)) disposer()
    this.staged.clear()
    this.saving = false
    this.saved = false
    this.failed = false
  }

  private snapshot(): SettingsScopeSnapshot<HttpProxySettings> {
    return this.scope.getSnapshot()
  }

  /** Hostnames offered by the host fields: the default DeepSeek host, every configured gateway, and what is already saved. */
  private suggestions(): string[] {
    const hosts = new Set<string>([DEFAULT_DEEPSEEK_HOST])
    const value = this.snapshot().value ?? {}
    const addList = (list: string[] | undefined): void => {
      if (!Array.isArray(list)) return
      for (const host of list) {
        // Normalize exactly like the Host half's routing, so the dropdown
        // never offers a casing/port variant of a host that is already saved.
        if (typeof host === 'string') {
          const normalized = normalizeHostEntry(host)
          if (normalized !== undefined) hosts.add(normalized)
        }
      }
    }
    addList(value.proxyHosts)
    addList(value.excludeHosts)
    const known = this.known.getSnapshot().value ?? {}
    for (const profile of Object.values(known.providers ?? {})) {
      const baseURL = profile.baseURL
      if (typeof baseURL === 'string' && baseURL.length > 0) {
        try {
          hosts.add(hostnameOf(baseURL))
        } catch {
          // A malformed baseURL is pi-ai's to reject, not this card's to judge.
        }
      }
    }
    return [...hosts].sort()
  }

  private projection(): HttpProxyCardState {
    const snap = this.snapshot()
    const value = snap.value ?? {}
    return {
      available: snap.status === 'ready',
      writable: snap.writable,
      proxy: this.staged.get('proxy') ?? (typeof value.proxy === 'string' ? value.proxy : ''),
      proxyHosts: this.staged.get('proxyHosts') ?? (Array.isArray(value.proxyHosts) ? value.proxyHosts.join(', ') : ''),
      excludeHosts: this.staged.get('excludeHosts') ?? (Array.isArray(value.excludeHosts) ? value.excludeHosts.join(', ') : ''),
      suggestions: this.suggestions(),
      dirty: this.staged.size > 0,
      saving: this.saving,
      saved: this.saved,
      failed: this.failed,
    }
  }

  private publish(): void {
    this.store.set(this.projection())
  }

  /** Build the face the card's slot registration injects. */
  inject(): HttpProxyCardFace {
    return {
      hooks: { httpProxyCard: this.store },
      edit: (field, text) => {
        this.staged.set(field, text)
        this.failed = false
        this.saved = false
        this.publish()
      },
      save: () => { void this.save() },
    }
  }

  private async save(): Promise<void> {
    if (this.staged.size === 0 || this.saving) return
    this.saving = true
    this.saved = false
    this.failed = false
    this.publish()
    let landed = true
    try {
      if (this.staged.has('proxy')) {
        const value = (this.staged.get('proxy') ?? '').trim()
        if (value === '') await this.scope.unset('proxy')
        else await this.scope.set('proxy', value)
      }
      if (this.staged.has('proxyHosts')) {
        const text = (this.staged.get('proxyHosts') ?? '').trim()
        if (text === '') await this.scope.unset('proxyHosts')
        else await this.scope.set('proxyHosts', this.splitHosts(text))
      }
      if (this.staged.has('excludeHosts')) {
        const text = (this.staged.get('excludeHosts') ?? '').trim()
        if (text === '') await this.scope.unset('excludeHosts')
        else await this.scope.set('excludeHosts', this.splitHosts(text))
      }
      this.staged.clear()
      this.saved = true
    } catch {
      landed = false
    }
    this.saving = false
    this.failed = !landed
    this.publish()
  }

  private splitHosts(text: string): string[] {
    return text.split(/[,\s]+/).filter(part => part.length > 0)
  }
}
