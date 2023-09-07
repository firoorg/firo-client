import { Firod } from '../firod';

export function handleEvent(store, firo: Firod, eventData: any) {
    store.dispatch('Masternode/updateMasternodeList', Object.values(eventData));
}

export const name = 'masternodeList';