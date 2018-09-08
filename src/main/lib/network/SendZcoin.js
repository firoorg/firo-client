import mixin from './mixin'
import types from '~/types'

export default {
    ...mixin,
    ...({
        namespace: 'ZcoinPayment',
        collection: 'sendZcoin',

        mutations: {
            [types.zcoinpayment.SEND_ZCOIN]: 'sendZcoin',
            [types.zcoinpayment.CALC_TX_FEE]: 'getTransactionFee'
        },

        convertToAddressAmountPair (payments) {
            let addresses = {}

            if (!payments || !payments.length) {
                return addresses
            }

            payments.forEach((payment) => {
                const { address, amount } = payment
                addresses[address] = amount
            })

            return addresses
        },

        convertToAmountLabel (payments) {
            let addresses = {}

            if (!payments || !payments.length) {
                return addresses
            }

            payments.forEach((payment) => {
                const { address, amount, label } = payment
                addresses[address] = {
                    amount,
                    label
                }
            })

            return addresses
        },

        getTransactionFee (data) {
            console.log('GETTING TX FEE', data)
            const { fee, paymentsMap } = data
            const addresses = this.convertToAddressAmountPair(paymentsMap)

            this.send({
                type: 'get',
                collection: 'txFee',
                data: {
                    addresses,
                    feePerKb: fee
                }
            }, {
                onSuccess: types.zcoinpayment.SET_TX_FEE
            })
        },

        sendZcoin (payload) {
            const { auth, data } = payload
            const { passphrase = null } = auth

            console.log('SENDING ZCOIN', data, auth)

            let addresses = this.convertToAmountLabel(data.payments)

            this.send({
                type: 'create',
                data: {
                    addresses,
                    feePerKb: data.fee
                },
                auth: {
                    passphrase
                }
            }, {
                onSuccess: types.zcoinpayment.ON_SEND_ZCOIN_SUCCESS,
                onError: types.zcoinpayment.ON_SEND_ZCOIN_ERROR
            })
        }
    })
}
