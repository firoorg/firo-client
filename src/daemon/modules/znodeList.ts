import { Zcoind } from '../zcoind';

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Znode/setStateWithZnodeList', data.nodes);
    store.dispatch('Znode/setZnodeCount', data.total);
}

export async function initialize(store: any, zcoind: Zcoind) {
    try {
        const data = await zcoind.send(null, 'initial', 'znodeList', null);

        if (Object.keys(data.nodes).length) {
            store.dispatch('Znode/setStateWithZnodeList', data.nodes);
            store.dispatch('Znode/setZnodeCount', data.total);
        }
    } catch (e) {
        if (e.error && e.error.code === -28) {
            // We haven't loaded the block index yet. We don't need to do anything, because a push event will be sent
            // instead.
            return;
        }

        throw e;
    }
}