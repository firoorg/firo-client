import { Zcoind } from '../zcoind';

// In addition to initializing the znode list, this function goes into an infinite loop refreshing the data every 5
// minutes.
export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Znode/setStateWithZnodeList', data.nodes);
    store.dispatch('Znode/setZnodeCount', data.total);
}