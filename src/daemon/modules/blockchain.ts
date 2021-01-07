import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:blockchain');

export async function handleEvent(store: any, firod: Firod, data: any) {
    store.commit('Blockchain/updateBlockchain', data);
}

export async function initialize(store: any, firod: Firod) {
    const data = await firod.send(null, 'get', 'blockchain', null);
    logger.info("Got initial blockchain data");
    store.commit('Blockchain/updateBlockchain', data);
}
