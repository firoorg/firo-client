import mixin from './mixin'
import types from '~/types'

export default {
    ...mixin,
    ...({
        namespace: 'Address',
        collection: 'stateWallet',

        mutations: {
            [types.address.UPDATE_SEND_TX_LABEL]: 'updatePublicLabel',
            [types.address.UPDATE_SPEND_TX_LABEL]: 'updatePrivateLabel'
        },

        subscriptions: [
            'address',
            'transaction'
        ],

        updatePublicLabel(payload) {
            const { label, address, txid } = payload

            console.log('UPDATING public LABEL', payload)

            this.send({
                type: 'update',
                collection: 'sendZcoin',
                data: {
                    label,
                    address,
                    txid
                }
            }, {
                onSuccess: types.address.UPDATED_SEND_TX_LABEL
            })
        },

        updatePrivateLabel(payload) {
            const { label, txid } = payload

            console.log('UPDATING private LABEL', payload)

            this.send({
                type: 'update',
                collection: 'sendPrivate',
                data: {
                    label,
                    txid
                }
            }, {
                onSuccess: types.address.UPDATED_SPEND_TX_LABEL
            })
        }
    })
}
