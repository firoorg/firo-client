import { Firod } from '../firod';

export function handleEvent(store, firo: Firod, eventData: any) {
    store.commit('Transactions/setWalletState', [eventData]);
}
