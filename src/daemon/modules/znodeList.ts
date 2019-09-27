import { Zcoind } from '../zcoind';

import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:daemon:znodeUpdate');

// In addition to initializing the znode list, this function goes into an infinite loop refreshing the data every 5
// minutes.
export async function initialize(store: any, zcoind: Zcoind) {
    while (true) {
        try {
            const data = await zcoind.send(null, 'initial', 'znodeList', null);

            if (Object.keys(data.nodes).length) {
                store.dispatch('Znode/setStateWithZnodeList', data.nodes);
                store.dispatch('Znode/setZnodeCount', data.total);

                if (Object.keys(data.nodes).length < data.total) {
                    // The list still hasn't loaded yet, and is showing only our own Znodes. Refresh in 5s.
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                } else {
                    // The list has loaded. Refresh again in 5 minutes.
                    await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
                }
            } else {
                store.dispatch('Znode/setZnodeCount', data.total);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        } catch (e) {
            // Error -28 is "Loading block index..."
            if (e.error && e.error.code === -28) {
                logger.warn("initial/znodeList returned error -28, loading block index. Trying again in 1s.");
                store.dispatch('Znode/setStateWithZnodeList', {});
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
                throw e;
            }
        }
    }
}