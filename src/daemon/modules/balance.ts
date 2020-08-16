import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:balance');

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.commit('Balance/updateBalance', data);
}

export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.send(null, 'get', 'balance', null);
    logger.info("Got initial balance data");
    store.commit('Balance/updateBalance', data);
}
