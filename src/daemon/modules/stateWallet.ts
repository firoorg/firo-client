import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:stateWallet');

export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.getStateWallet();
    logger.info("Got stateWallet");
    await store.dispatch('Transactions/setWalletState', data);

    // stateWallet will trigger the daemon to send address events which must be processed before we can consider
    // ourselves loaded. Transactions/walletLoaded will be set to true when that happens.
    while (!store.getters['Transactions/walletLoaded']) {
        await new Promise(r => setTimeout(r, 500));
    }

    //load address book
    const ab = await zcoind.readAddressBook();
    await store.dispatch('Transactions/setAddressBook', ab);

    //load payment codes
    const pcs = await zcoind.getPaymentCodes();
    await store.dispatch('Transactions/setPaymentCodes', pcs);

    const paymentChannelsState = await zcoind.readPaymentChannelsState();
    store.dispatch('Transactions/setPaymentChannels', Object.values(paymentChannelsState));
}