import { Zcoind } from '../zcoind';

export function handleEvent(store: any, zcoind: Zcoind, eventData: any) {
    store.dispatch('Transactions/handleAddressEvent', eventData);
}