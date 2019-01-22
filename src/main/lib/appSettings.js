import { getAppSettings } from '#/lib/utils'
import types from '~/types'

export const populateStoreWithAppSettings = function ({ store }) {
    const settings = getAppSettings()
    const { app: appSettings } = settings.getAll()

    if (!appSettings) {
        return
    }

    Object.entries(appSettings).forEach(([key, value]) => {
        if (!types.app[key]) {
            return
        }

        console.log('populating application settings store', key, value)
        store.dispatch(types.app[key], value)
    })
}
