/**
 * The `settings.plugin.item` slot type for the http-proxy card — mirrors the
 * declaration in the DSH settings shell so this package can type its own card
 * registration without importing that package's value (client purity gate).
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.plugin.item': {
            kind: 'keyed';
            scope: 'root';
            owner: HttpProxyCardOwnerProps;
        };
    }
}
/** Owner share of the http-proxy card (the settings shell supplies nothing). */
export interface HttpProxyCardOwnerProps {
    children?: never;
}
//# sourceMappingURL=slot-contract.d.ts.map