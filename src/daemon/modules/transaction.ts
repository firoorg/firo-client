import { Firod } from '../firod';

export async function handleEvent(store, firod: Firod, eventData: any) {
    store.commit('Transactions/setWalletState', [eventData]);
}

export const name = 'transaction';