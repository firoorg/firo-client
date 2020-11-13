import { Firod } from '../firod';

export function handleEvent(store, firo: Firod, eventData: any) {
    store.dispatch('Transactions/handleTransactionEvent', eventData);
}
