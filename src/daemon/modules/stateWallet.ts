import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:stateWallet');


export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitBlockIndex();

    const data = await zcoind.getStateWallet();
    logger.info("Got stateWallet");
    store.dispatch('Transactions/setWalletState', data);
}