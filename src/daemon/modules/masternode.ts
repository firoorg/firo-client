import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    let key = Object.keys(eventData)[0];
    let mn = eventData[key];
    logger.info('handleEventmasternode:', mn)
    store.dispatch('Masternode/updateMasternode', mn);
}

export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitApiIsReady();

    const data = await zcoind.getMasternodeList();
    console.log("Got initial masternode list data:", data);
    for(const mn of Object.values(data)) {
        store.dispatch('Masternode/updateMasternode', mn);
    }
}