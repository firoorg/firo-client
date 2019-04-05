import types from '~/types'
import mixin from './mixin'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:paymentRequest')

export default {
    ...mixin,
    ...({
        namespace: 'PaymentRequest',
        collection: 'paymentRequest',

        mutations: {
            [types.paymentrequest.CREATE_PAYMENT_REQUEST]: 'createPaymentRequest',
            [types.paymentrequest.UPDATE_PAYMENT_REQUEST_LABEL]: 'updateLabel',
            [types.paymentrequest.ARCHIVE_PAYMENT_REQUEST]: 'archivePaymentRequest'
        },

        createPaymentRequest ({ label, message, amount }) {
            logger.info('CREATING PAYMENT REQUEST: %o', { label, message, amount })

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

        updateLabel ({ label, createdAt, address }) {
            this.send({
                type: 'update',
                data: {
                    label,
                    createdAt,
                    id: address
                }
            }, {
                onSuccess: types.paymentrequest.ADD_PAYMENT_REQUEST
            })
        },

        archivePaymentRequest (address) {
            this.send({
                type: 'update',
                data: {
                    id: address,
                    state: 'archived'
                }
            }, {
                onSuccess: types.paymentrequest.ADD_PAYMENT_REQUEST
            })
        }
    })
}
