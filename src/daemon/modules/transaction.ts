import { Firod } from '../firod';

export async function handleEvent(store, firod: Firod, eventData: any) {
    store.commit('Transactions/setWalletState', [eventData]);
    if(eventData.inputType == "sparkspend") {
        store.commit('Transactions/setWalletState', await firod.getStateWallet());
    }
}
