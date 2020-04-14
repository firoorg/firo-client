import { Zcoind } from '../zcoind';

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Znode/setStateWithZnodeList', data.nodes);
    store.dispatch('Znode/setZnodeCount', data.total);
}

export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitBlockIndex();

    const data = await zcoind.send(null, 'initial', 'znodeList', null);

    if (Object.keys(data.nodes).length) {
        store.dispatch('Znode/setStateWithZnodeList', data.nodes);
        store.dispatch('Znode/setZnodeCount', data.total);
    }
}