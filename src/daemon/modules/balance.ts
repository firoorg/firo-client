import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:balance');

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Balance/updateBalance', data);
}

export async function initialize(store: any, zcoind: Zcoind) {
    while (true) {
        try {
            const data = await zcoind.send(null, 'get', 'balance', null);
            logger.info("Got initial balance data");
            store.dispatch('Balance/updateBalance', data);
            return;
        } catch (e) {
            // Error -28 is "Loading block index..."
            if (e.error && e.error.code && e.error.code === -28) {
                logger.warn("get/balance returned error -28, loading block index. Trying again in 1s.");
                await new Promise((resolve) => setTimeout(resolve, 2000)); // sleep 2s
            } else {
                throw e;
            }
        }
    }
}