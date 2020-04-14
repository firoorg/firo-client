import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:paymentRequest');


export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitBlockIndex();

    const data = await zcoind.send(null, 'initial', 'paymentRequest', {});
    logger.info("Got initial paymentRequest data");
    store.dispatch('PaymentRequest/setStateWithInitialPaymentRequest', data);
}