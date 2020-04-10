import {Zcoind} from "../zcoind";

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export async function initialize(store: any, zcoind: Zcoind) {
    store.dispatch('PaymentRequest/settings', {});

    while (true) {
        try {
            const data = await zcoind.send(null, 'initial', 'settings', {});
            logger.info("Got initial settings data");
            store.dispatch('PaymentRequest/setStateWithInitialPaymentRequest', data);
            return;
        } catch (e) {
            // Error -28 is "Loading block index..."
            if (e.error && e.error.code && e.error.code === -28) {
                logger.warn("initial/settings returned error -28, loading block index. Trying again in 1s.");
                await new Promise((resolve) => setTimeout(resolve, 2000)); // sleep 2s
            } else {
                throw e;
            }
        }
    }
}