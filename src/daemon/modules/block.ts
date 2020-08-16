import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:blockchain');

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.commit('Blockchain/updateBlockchain', data);
}

export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.send(null, 'get', 'blockchain', null);
    logger.info("Got initial blockchain data");
    store.commit('Blockchain/updateBlockchain', data);
}
