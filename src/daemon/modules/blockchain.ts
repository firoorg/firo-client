import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:blockchain');

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Blockchain/updateBlockchain', data);
}

export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitBlockIndex();

    const data = await zcoind.send(null, 'get', 'blockchain', null);
    logger.info("Got initial blockchain data");
    store.dispatch('Blockchain/updateBlockchain', data);
}