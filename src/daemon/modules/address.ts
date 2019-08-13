import { Zcoind } from '../zcoind';

export function handleEvent(store: any, zcoind: Zcoind, eventData: any) {
    console.log(eventData);
    store.dispatch('Transactions/handleAddressEvent', eventData);
}