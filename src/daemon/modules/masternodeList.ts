import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    store.dispatch('Masternode/updateMasternodeList', Object.values(eventData));
}
