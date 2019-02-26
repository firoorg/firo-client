import mixin from './mixin'
import types from '~/types'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:settings')

export default {
    ...mixin,
    ...({
        namespace: 'Settings',
        collection: 'setting',

        mutations: {
            [types.settings.UPDATE_SETTING]: 'updateSetting'
        },

        updateSetting (data) {
            logger.info('updating setting', data)
            const { name, value } = data

            this.send({
                type: 'update',
                data: {
                    [name]: {
                        data: value
                    }
                }
            }, {
                onSuccess: () => {
                    console.log(arguments)
                    logger.info('on success %o', arguments)
                },
                onError: () => {
                    console.log(arguments)
                    logger.info('on success %o', arguments)
                }
            })
        }
    })
}
