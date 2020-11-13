import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:balance');

export async function handleEvent(store: any, firod: Firod, data: any) {
    store.commit('Balance/updateBalance', data);
}

export async function initialize(store: any, firod: Firod) {
    const data = await firod.send(null, 'get', 'balance', null);
    logger.info("Got initial balance data");
    store.commit('Balance/updateBalance', data);
}
