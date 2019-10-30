import { getAppSettings } from '#/lib/utils'
import types from '~/types'

import { createLogger } from '#/lib/logger'
const logger = createLogger('zcoin:appSettings')

export const populateStoreWithAppSettings = async function ({ store }) {
    for (const [categoryKey, value] of Object.entries(await getAppSettings().getAll())) {
        logger.info(`key ${categoryKey} with value ${value}`);

        const [category, ...key_] = categoryKey.split('.');
        const key = key_.join('.');

        try {
            if (!(types[category] && types[category][key])) {
                logger.warn(`Unknown key ${categoryKey} with value ${value}`);
            }
        } catch(e) {
            logger.error(e);
        }

        store.dispatch(types[category][key], value);
    }
};
