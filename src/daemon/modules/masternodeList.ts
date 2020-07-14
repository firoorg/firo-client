import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    logger.info('handleEventmasternodeList: %s', JSON.stringify(eventData))
    store.dispatch('Masternode/updateMasternodeList', Object.values(eventData));
}