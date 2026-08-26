/**
 * The http-proxy settings card's staged form over the `http-proxy` namespace.
 *
 * A card stages what the user types and writes only on save, so a typed draft
 * never mutates the durable document before the user commits it. The Host's
 * validator remains the authority on what lands; a save that did not land keeps
 * its drafts so the user can correct them.
 */
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** The `http-proxy` section fields this card edits. */
export interface HttpProxySettings {
    /** Proxy URL (http/https/socks4/socks4a/socks5/socks5h); empty = inactive. */
    proxy?: string;
    /** Hostnames to proxy (empty = auto-detect every model host). */
    proxyHosts?: string[];
    /** Hostnames never proxied. */
    excludeHosts?: string[];
}
/** One editable field of the card. */
type FieldName = 'proxy' | 'proxyHosts' | 'excludeHosts';
/** What the http-proxy card renders. */
export interface HttpProxyCardState {
    /** False while the namespace is not served to this client. */
    available: boolean;
    /** Whether the Host document accepts writes. */
    writable: boolean;
    /** Staged proxy URL. */
    proxy: string;
    /** Staged proxy-only hosts, comma/space separated. */
    proxyHosts: string;
    /** Staged excluded hosts, comma/space separated. */
    excludeHosts: string;
    /** Whether the form holds edits a save would write. */
    dirty: boolean;
    /** Whether a save is crossing the wire. */
    saving: boolean;
    /** Whether the last save landed as staged. */
    saved: boolean;
    /** Whether the last save did not land. */
    failed: boolean;
}
/** The registration-side face the card's slot entry injects. */
export interface HttpProxyCardFace {
    /** Card snapshot bound by the renderer as useHttpProxyCard. */
    hooks: {
        httpProxyCard: SnapshotStore<HttpProxyCardState>;
    };
    /** Stage draft text for one field. */
    edit: (field: FieldName, text: string) => void;
    /** Write every staged edit. */
    save: () => void;
    /** Drop every staged edit. */
    discard: () => void;
}
/** Bridges the `http-proxy` scope onto the card with a minimal staged form. */
export declare class HttpProxyCardController {
    private readonly scope;
    private readonly store;
    private readonly staged;
    private saving;
    private saved;
    private failed;
    /** @param scope - the bound settings scope for the `http-proxy` namespace. */
    constructor(scope: SettingsScope<HttpProxySettings>);
    private snapshot;
    private projection;
    private publish;
    /** Build the face the card's slot registration injects. */
    inject(): HttpProxyCardFace;
    private save;
    private splitHosts;
}
export {};
//# sourceMappingURL=card-controller.d.ts.map