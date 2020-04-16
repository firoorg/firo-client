import { getAppSettings } from '#/lib/utils'
import types from '~/types'

import { createLogger } from '#/lib/logger'
const logger = createLogger('zcoin:appSettings')

export const populateStoreWithAppSettings = async function ({ store }) {
    for (const [categoryKey, value] of Object.entries(await getAppSettings().getAll())) {
        logger.info(`key ${categoryKey} with value ${value}`);

        const action = categoryKey[0].toUpperCase() + categoryKey.substr(1).replace('.', '/');

        if (!store._actions[action]) {
            throw `Unknown action: ${action}`;
        }
        await store.dispatch(action, value);
    }
};
