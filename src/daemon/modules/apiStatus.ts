import { Zcoind } from '../zcoind';

export function handleEvent(store, zcoind: Zcoind, eventData: any) {
    store.commit('ApiStatus/setApiStatus', eventData);
}