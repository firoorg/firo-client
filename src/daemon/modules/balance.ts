import { Zcoind } from '../zcoind';

export async function handleEvent(store: any, zcoind: Zcoind, data: any) {
    store.dispatch('Balance/updateBalance', data);
}

export async function initialize(store: any, zcoind: Zcoind) {
    const data = await zcoind.send(null, 'get', 'balance', null);
    store.dispatch('Balance/updateBalance', data);
}