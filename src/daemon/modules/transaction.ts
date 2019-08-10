import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:transaction');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    store.dispatch('Transactions/handleTransactionEvent', eventData);
}