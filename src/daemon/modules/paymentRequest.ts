import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:address');


export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.send(null, 'initial', 'paymentRequest', {});
    logger.info("Got initial paymentRequest data");
    store.dispatch('PaymentRequest/setStateWithInitialPaymentRequest', data);
}