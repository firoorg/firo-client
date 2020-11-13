import {Firod} from "../firod";

import { createLogger } from '../../lib/logger';
const logger = createLogger('firo:daemon:settings');

export async function initialize(store: any, firod: Firod) {
    await firod.awaitApiIsReady();

    const data = await firod.getSettings();
    logger.info("Got initial settings data");
    store.commit('Settings/setDaemonSettings', data);
}
