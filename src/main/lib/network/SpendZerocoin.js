import mixin from './mixin'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:spendZerocoin')

export default {
    ...mixin,
    ...({
        namespace: 'ZerocoinSpend',
        collection: 'sendPrivate',

        mutations: {
            [types.zerocoinspend.SPEND_ZEROCOIN]: 'spendZerocoin'
        },

        spendZerocoin (payload) {
            const { auth, data } = payload
            const { passphrase = null } = auth

            logger.info('SENDING ZEROCOIN: %o', data)

            const { address, label, denomination } = data

            this.send({
                type: 'create',
                data: {
                    address,
                    denomination,
                    label
                },
                auth: {
                    passphrase
                }
            }, {
                onSuccess: types.zerocoinspend.ON_SPEND_ZEROCOIN_SUCCESS,
                onError: types.zerocoinspend.ON_SPEND_ZEROCOIN_ERROR
            })
        }
    })
}
