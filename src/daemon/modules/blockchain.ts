import { Firod } from '../firod';

export async function handleEvent(store: any, firod: Firod, data: any) {
    store.commit('Blockchain/updateBlockchain', data);
}

export async function initialize(store: any, firod: Firod) {
    store.commit('Blockchain/updateBlockchain', await firod.send(null, 'get', 'blockchain', null));
}
