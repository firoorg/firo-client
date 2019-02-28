import mixin from './mixin'
import types from '~/types'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:settings')

export default {
    ...mixin,
    ...({
        namespace: 'Settings',
        collection: 'setting',

        subscriptions: [
            'setting'
        ],

        mutations: {
            [types.settings.UPDATE_SETTING]: 'updateSetting'
        },

        updateSetting (data) {
            logger.info('updating setting', data)

            const { name, value, create } = data
            const type = create ? 'create' : 'update'

            this.send({
                type,
                data: {
                    [`-${name}`]: {
                        data: value
                    }
                }
            })
        }
    })
}
