import { Firod } from '../firod';

export function handleEvent(store, firod: Firod, eventData: any) {
    store.dispatch('ApiStatus/setApiStatus', eventData);
}
