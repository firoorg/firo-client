import { Firod } from '../firod';

export async function initialize(store: any, firod: Firod) {
    await firod.awaitApiResponse();
    await firod.awaitBlockchainLoaded();

    store.commit('Transactions/setWalletState', await firod.getStateWallet());
}
