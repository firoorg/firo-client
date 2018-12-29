import types from '../../../store/types'
import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'PaymentRequest',
        collection: 'paymentRequest',

        mutations: {
            [types.paymentrequest.CREATE_PAYMENT_REQUEST]: 'createPaymentRequest',
            [types.paymentrequest.UPDATE_PAYMENT_REQUEST_LABEL]: 'updateLabel'
        },

        createPaymentRequest ({ label, message, amount }) {
            console.log('CREATING PAYMENT REQUEST')

            this.send({
                type: 'create',
                data: {
                    label,
                    amount,
                    message
                }
            }, {
                onSuccess: types.paymentrequest.ADD_PAYMENT_REQUEST
            })
        },

        updateLabel ({ label, address }) {
            this.send({
                type: 'update',
                data: {
                    label,
                    id: address
                }
            }, {
                onSuccess: types.paymentrequest.ADD_PAYMENT_REQUEST
            })
        }
    })
}
