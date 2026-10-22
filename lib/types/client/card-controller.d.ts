/**
 * The http-proxy settings tab's staged form over the `http-proxy` namespace,
 * plus the read-only `llm-pi-ai` view that supplies the hostname suggestions
 * for the two host fields.
 *
 * A tab stages what the user types and writes only on save, so a typed draft
 * never mutates the durable document before the user commits it. The Host's
 * validator remains the authority on what lands; a save that did not land keeps
 * its drafts so the user can correct them.
 */
import type { ConfigForm } from './settings-forms-017.js';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
/** The `http-proxy` section fields this card edits. */
export interface HttpProxySettings {
    /** Proxy URL (http/https/socks4/socks4a/socks5/socks5h); empty = inactive. */
    proxy?: string;
    /** Hostnames to proxy (empty = auto-detect every model host). */
    proxyHosts?: string[];
    /** Hostnames never proxied. */
    excludeHosts?: string[];
}
/** The `llm-pi-ai` section subset this card reads for known model gateways. */
export interface PiAiSettings {
    providers?: Record<string, {
        baseURL?: string;
    }>;
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
    /** Known model hostnames offered by the host fields' dropdown (free text still allowed). */
    suggestions: string[];
    /** Whether the form holds edits a save would write. */
    dirty: boolean;
    /** Whether a save is crossing the wire. */
    saving: boolean;
    /** Whether the last save landed as staged. */
    saved: boolean;
    /** Whether the last save did not land. */
    failed: boolean;
}
/** The registration-side face the tab's slot entry renders. */
export interface HttpProxyCardFace {
    /** Tab snapshot bound by the renderer as useHttpProxyCard. */
    hooks: {
        httpProxyCard: SnapshotStore<HttpProxyCardState>;
    };
    /** Stage draft text for one field. */
    edit: (field: FieldName, text: string) => void;
    /** Write every staged edit. */
    save: () => void;
}
/** Bridges the `http-proxy` form onto the tab with a minimal staged form. */
export declare class HttpProxyCardController {
    private readonly scope;
    private readonly known;
    private readonly store;
    private readonly staged;
    private readonly disposers;
    private saving;
    private saved;
    private failed;
    /**
     * @param scope - the shared settings form for the `http-proxy` namespace.
     * @param known - the read-only `llm-pi-ai` form that supplies gateway hostnames.
     */
    constructor(scope: ConfigForm<HttpProxySettings>, known: ConfigForm<PiAiSettings>);
    /** Stop observing both forms and drop the staged drafts. Idempotent. */
    dispose(): void;
    private snapshot;
    /**
     * Hostnames offered by the host fields: the default DeepSeek host, the
     * built-in pi-ai catalog endpoints, every configured gateway, and what is
     * already saved.
     */
    private suggestions;
    private projection;
    private publish;
    /** Build the face the card's slot registration injects. */
    inject(): HttpProxyCardFace;
    private save;
    private splitHosts;
}
export {};
//# sourceMappingURL=card-controller.d.ts.map