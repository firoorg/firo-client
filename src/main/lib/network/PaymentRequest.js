import types from '../../../store/types'
import mixin from './mixin'

export default {
    ...mixin,
    ...({
        namespace: 'PaymentRequest',
        collection: 'paymentrequest',

        mutations: {
            [types.paymentrequest.CREATE_PAYMENT_REQUEST]: 'createPaymentRequest'
        },

        createPaymentRequest ({ label, message, amount }) {
            console.log('CREATING PAYMENT REQUEST')

            this.send({
                type: 'create',
                data: {
                    label,
                    amount,
                    message
                },
                actionToDispatch: types.paymentrequest.ADD_PAYMENT_REQUEST
            })
        }
    })
}
