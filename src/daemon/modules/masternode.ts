import { Firod } from '../firod';


export function handleEvent(store, firo: Firod, eventData: any) {
    store.dispatch('Masternode/updateMasternodeList', Object.values(eventData));
}

export async function initialize(store: any, firod: Firod) {
    firod.awaitBlockchainSynced().then(async () => {
        const data = await firod.getMasternodeList();
        store.dispatch('Masternode/updateMasternodeList', Object.values(data));
    });
}
