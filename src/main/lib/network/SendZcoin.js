import mixin from './mixin'
import types from '~/types'

export default {
    ...mixin,
    ...({
        namespace: 'ZcoinPayment',
        collection: 'send-zcoin',

        mutations: {
            [types.zcoinpayment.SEND_ZCOIN]: 'sendZcoin',
            [types.zcoinpayment.CALC_TX_FEE]: 'getTransactionFee'
        },

        convertToAddressAmountPair (payments) {
            let addresses = {}

            payments.forEach((payment) => {
                const { address, amount } = payment
                addresses[address] = amount
            })

            return addresses
        },

        getTransactionFee (data) {
            console.log('GETTING TX FEE', data)
            const { fee, payments } = data
            const addresses = this.convertToAddressAmountPair(payments)

            this.send({
                type: 'get',
                collection: 'tx-fee',
                data: {
                    addresses,
                    feeperkb: fee
                },
                actionToDispatch: types.zcoinpayment.SET_TX_FEE
            })
        },

        sendZcoin (data) {
            console.log('SENDING ZCOIN')

            let addresses = this.convertToAddressAmountPair(data.payments)

            console.log(addresses, data.fee)

            this.send({
                type: 'create',
                data: {
                    addresses,
                    feeperkb: data.fee
                }
            })
        }
    })
}
