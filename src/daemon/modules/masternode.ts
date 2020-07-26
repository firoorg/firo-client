import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    let key = Object.keys(eventData)[0];
    let mn = eventData[key];
    store.dispatch('Masternode/updateMasternode', mn);
}

export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitApiIsReady();

    const data = await zcoind.getMasternodeList();
    store.dispatch('Masternode/updateMasternodeList', Object.values(data));
}