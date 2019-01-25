import { getAppSettings } from '#/lib/utils'
import { createLogger } from '#/lib/logger'

import types from '~/types'

const logger = createLogger('zcoin:appSettings')

export const populateStoreWithAppSettings = function ({ store }) {
    const settings = getAppSettings()

    logger.info('application settings path %s', settings.file())

    const { app: appSettings } = settings.getAll()

    if (!appSettings) {
        return
    }

    Object.entries(appSettings).forEach(([key, value]) => {
        if (!types.app[key]) {
            return
        }

        logger.info('populating application settings store: %s : %o', key, value)
        store.dispatch(types.app[key], value)
    })
}
