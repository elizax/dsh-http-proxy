/**
 * Client half of dsh-http-proxy: registers the `http-proxy` settings card in
 * the DSH Settings → 插件配置 tab. The Host half (src/index.ts) registers the
 * same `http-proxy` namespace; the tab pairs the two without learning what the
 * namespace means.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Mount the http-proxy settings card.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map