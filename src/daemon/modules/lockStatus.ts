import { Firod } from '../firod';

export async function handleEvent(store, firod: Firod, eventData: any) {
    store.commit('Transactions/markLockedTransaction', eventData);
    store.commit('Balance/updateBalance', await firod.send(null, 'initial', 'balance', null));
}
