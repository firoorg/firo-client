import { getAppSettings } from '#/lib/utils'
import { createLogger } from '#/lib/logger'

import types from '~/types'

const logger = createLogger('zcoin:appSettings')

export const populateStoreWithAppSettings = function ({ store }) {
    const settings = getAppSettings()

    logger.info('application settings path %s', settings.file())

    console.log(settings.getAll())

    Object
        .entries(settings.getAll())
        .forEach(([category, pairs]) => {
            console.log(category, pairs)

            if (!pairs) {
                return
            }

            Object.entries(pairs).forEach(([key, value]) => {
                if (!types[category] || !types[category][key]) {
                    return
                }

                logger.info('populating application settings store: %s : %o', key, value)
                store.dispatch(types[category][key], value)
            })
        })
    //const { app: appSettings } = settings.getAll()
}
