import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:stateWallet');


export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.getStateWallet();
    logger.info("Got stateWallet");
    await store.dispatch('Transactions/setWalletState', data);
}