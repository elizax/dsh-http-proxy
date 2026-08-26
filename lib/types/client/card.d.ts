/**
 * The http-proxy settings card: a proxy URL plus optional extra hostnames,
 * staged and written on save through the `http-proxy` settings scope.
 */
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { HttpProxyCardFace } from './card-controller.js';
/** Props the renderer binds for the http-proxy card. */
export type HttpProxyCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<HttpProxyCardFace>;
/**
 * Render the http-proxy card.
 * @param props - the card snapshot and its form actions.
 * @returns the card, or nothing while the namespace is unavailable.
 */
export declare function HttpProxyCard(props: HttpProxyCardProps): import("react").JSX.Element | null;
//# sourceMappingURL=card.d.ts.map