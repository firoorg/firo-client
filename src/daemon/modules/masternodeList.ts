import { Firod } from '../firod';

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:settings');

export function handleEvent(store, firo: Firod, eventData: any) {
    store.dispatch('Masternode/updateMasternodeList', Object.values(eventData));
}
