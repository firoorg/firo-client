import { Firod } from '../firod';

export async function handleEvent(store: any, firod: Firod, data: any) {
    store.commit('Balance/updateBalance', data);
}

export async function initialize(store: any, firod: Firod) {
    store.commit('Balance/updateBalance', await firod.send(null, 'get', 'balance', null));
}
