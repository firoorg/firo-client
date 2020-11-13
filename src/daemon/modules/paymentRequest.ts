import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:paymentRequest');


export async function initialize(store: any, firod: Firod) {
    const data = await firod.send(null, 'initial', 'paymentRequest', {});
    logger.info("Got initial paymentRequest data");
    store.commit('PaymentRequest/setStateWithInitialPaymentRequest', data);
}
