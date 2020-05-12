import { Zcoind } from '../zcoind';

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    store.dispatch('Transactions/handleTransactionEvent', eventData);
}