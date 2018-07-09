import mixin from './mixin'
import types from '~/types'

export default {
    ...mixin,
    ...({
        namespace: 'ZcoinPayment',
        collection: 'send-zcoin',

        mutations: {
            [types.zcoinpayment.SEND_ZCOIN]: 'sendZcoin'
        },

        sendZcoin (data) {
            console.log('SENDING ZCOIN')

            let addresses = {}

            data.payments.forEach((payment) => {
                // const { address, amount } = payment.

                addresses[payment.address] = parseFloat(payment.amount)
            })

            console.log(addresses, data.fee)

            /*
            this.requester.send(JSON.stringify({
                collection: 'send-zcoin',
                type: 'create',
                data: {
                    addresses,
                    feeperkb: data.fee
                }
            }))
            */

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
