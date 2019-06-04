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

        // amount in satoshis
        spendZerocoin ({label, address, amount, auth}) {
            this.send({
                type: 'create',
                data: {
                    label,
                    outputs: [
                        {
                            address,
                            amount
                        }
                    ]
                },
                auth: {
                    passphrase: auth
                }
            }, {
                onSuccess: types.zerocoinspend.ON_SPEND_ZEROCOIN_SUCCESS,
                onError: types.zerocoinspend.ON_SPEND_ZEROCOIN_ERROR
            })
        }
    })
}
