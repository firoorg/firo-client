import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:address');


export async function initialize(store: any, zcoind: Zcoind) {
    while (true) {
        try {
            const data = await zcoind.send(null, 'initial', 'stateWallet', {});
            store.dispatch('Transactions/setWalletState', data);
            return;
        } catch (e) {
            // Error -28 is "Loading block index..."
            if (e.error && e.error.code && e.error.code === -28) {
                logger.warn("initial/stateWallet returned error -28, loading block index. Trying again in 1s.");
                store.dispatch('Transactions/setWalletState', {addresses: {}});
                await new Promise((resolve) => setTimeout(resolve, 2000)); // sleep 2s
            } else {
                throw e;
            }
        }
    }
}