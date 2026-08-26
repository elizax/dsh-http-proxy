/**
 * The http-proxy settings card's staged form over the `http-proxy` namespace.
 *
 * A card stages what the user types and writes only on save, so a typed draft
 * never mutates the durable document before the user commits it. The Host's
 * validator remains the authority on what lands; a save that did not land keeps
 * its drafts so the user can correct them.
 */

import type { SettingsScope, SettingsScopeSnapshot, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'

/** The `http-proxy` section fields this card edits. */
export interface HttpProxySettings {
  /** Proxy URL (http/https/socks4/socks4a/socks5/socks5h); empty = inactive. */
  proxy?: string
  /** Hostnames to proxy (empty = auto-detect every model host). */
  proxyHosts?: string[]
  /** Hostnames never proxied. */
  excludeHosts?: string[]
}

/** One editable field of the card. */
type FieldName = 'proxy' | 'proxyHosts' | 'excludeHosts'

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
  /** Whether a save is crossing the wire. */
  saving: boolean
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
  /** Drop every staged edit. */
  discard: () => void
}

/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
export class HttpProxyCardController {
  private readonly store: SnapshotStore<HttpProxyCardState>
  private readonly staged = new Map<FieldName, string>()
  private saving = false
  private failed = false

  /** @param scope - the bound settings scope for the `http-proxy` namespace. */
  constructor(private readonly scope: SettingsScope<HttpProxySettings>) {
    this.store = createSnapshotStore(this.projection())
    scope.subscribe(() => this.publish())
  }

  private snapshot(): SettingsScopeSnapshot<HttpProxySettings> {
    return this.scope.getSnapshot()
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
      saving: this.saving,
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
        this.publish()
      },
      save: () => { void this.save() },
      discard: () => {
        this.staged.clear()
        this.failed = false
        this.publish()
      },
    }
  }

  private async save(): Promise<void> {
    if (this.staged.size === 0 || this.saving) return
    this.saving = true
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
