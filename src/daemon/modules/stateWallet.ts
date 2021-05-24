import { Firod } from '../firod';

export async function initialize(store: any, firod: Firod) {
    await firod.awaitApiResponse();
    await firod.awaitBlockchainLoaded();

    await store.dispatch('Transactions/setWalletState', await firod.getStateWallet());

    // stateWallet will trigger the daemon to send address events which must be processed before we can consider
    // ourselves loaded. Transactions/walletLoaded will be set to true when that happens.
    while (!store.getters['Transactions/walletLoaded']) {
        await new Promise(r => setTimeout(r, 500));
    }
}
