import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:settings');

export function handleEvent(store, firo: Firod, eventData: any) {
    let key = Object.keys(eventData)[0];
    let mn = eventData[key];
    store.dispatch('Masternode/updateMasternode', mn);
}

export async function initialize(store: any, firod: Firod) {
    firod.awaitBlockchainSynced().then(async () => {
        const data = await firod.getMasternodeList();
        store.dispatch('Masternode/updateMasternodeList', Object.values(data));
    });
}
