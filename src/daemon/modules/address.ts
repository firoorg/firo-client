import { Firod } from '../firod';

export function handleEvent(store: any, firod: Firod, eventData: any) {
    store.dispatch('Transactions/handleAddressEvent', eventData);
}
