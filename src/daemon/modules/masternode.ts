import { Zcoind } from '../zcoind';

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    let key = Object.keys(eventData)[0];
    let mn = eventData[key];
    console.log('handleEventmasternode:', mn)
    store.dispatch('Masternode/updateMasternode', mn);
}