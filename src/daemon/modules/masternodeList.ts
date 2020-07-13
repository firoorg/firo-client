import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export function handleEvent(store, zcoin: Zcoind, eventData: any) {
    logger.info('handleEventmasternodeList: %s', JSON.stringify(eventData))
    for(const mn of Object.values(eventData)) {
        store.dispatch('Masternode/updateMasternode', mn);
    }
}