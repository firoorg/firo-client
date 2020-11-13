import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:stateWallet');

export async function initialize(store: any, firod: Firod) {
    const data = await firod.getStateWallet();
    logger.info("Got stateWallet");
    await store.dispatch('Transactions/setWalletState', data);

    // stateWallet will trigger the daemon to send address events which must be processed before we can consider
    // ourselves loaded. Transactions/walletLoaded will be set to true when that happens.
    while (!store.getters['Transactions/walletLoaded']) {
        await new Promise(r => setTimeout(r, 500));
    }
}
