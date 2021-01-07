import { Firod } from '../firod';

export async function handleEvent(store: any, firod: Firod, data: any) {
    store.commit('Blockchain/updateBlockchain', data);
}