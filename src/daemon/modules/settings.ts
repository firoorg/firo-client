import {Zcoind} from "../zcoind";

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:settings');

export async function initialize(store: any, zcoind: Zcoind) {
    await zcoind.awaitApiIsReady();

    const data = await zcoind.getSettings();
    logger.info("Got initial settings data");
    store.commit('Settings/setDaemonSettings', data);
}