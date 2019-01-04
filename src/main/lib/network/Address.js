import mixin from './mixin'
import types from '~/types'

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

            console.log('UPDATING transaction LABEL', payload)

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
