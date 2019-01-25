import mixin from './mixin'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:address')

export default {
    ...mixin,
    ...({
        namespace: 'Address',
        collection: 'stateWallet',

        mutations: {
            [types.address.UPDATE_TX_LABEL]: 'updateTransactionLabel',
        },

        subscriptions: [
            'address',
            'transaction'
        ],

        updateTransactionLabel(payload) {
            const { label, address, txid } = payload

            logger.info('UPDATING transaction LABEL', payload)

            this.send({
                type: 'update',
                collection: 'updateLabels',
                data: {
                    label,
                    address,
                    txid
                }
            }, {
                onSuccess: types.address.UPDATED_TX_LABEL
            })
        }
    })
}
