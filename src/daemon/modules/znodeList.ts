import { Zcoind } from '../zcoind';

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.commit('Znode/setStateWithZnodeList', data.nodes);
    store.commit('Znode/setZnodeCount', data.total);
}

export async function initialize(store: any, zcoind: Zcoind) {
    // fixme: properly type this
    const data = <any>await zcoind.send(null, 'initial', 'znodeList', null);

    if (Object.keys(data.nodes).length) {
        store.commit('Znode/setStateWithZnodeList', data.nodes);
        store.commit('Znode/setZnodeCount', data.total);
    }
}