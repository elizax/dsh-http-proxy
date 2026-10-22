/**
 * Client half of dsh-http-proxy: registers the `http-proxy` settings tab in
 * the DSH Settings → Plugins section. The Host half (src/index.ts) owns the
 * same `http-proxy` namespace; the tab pairs the two without learning what the
 * namespace means.
 *
 * 0.1.7 migration: the `settingsScope` service was removed upstream and this
 * module's inject of it left the browser fiber pending forever ("waiting for
 * service: settingsScope"), blocking the whole Web boot. The replacement face
 * is the settings provider's shared `configForms` service: one
 * `ConfigForm<T>` per namespace with getSnapshot/subscribe/set/unset.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Mount the http-proxy settings tab.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map