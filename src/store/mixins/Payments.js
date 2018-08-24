import { convertToCoin } from '#/lib/convert'
import { getName } from '~/mixins/utils'

const types = function (namespace) {
    const { NAME: PAYMENTS } = getName(`pending ${namespace} payments`)

    return {
        [`ADD_${PAYMENTS}`]: `ADD_${PAYMENTS}`,
        [`CLEAR_${PAYMENTS}`]: `CLEAR_${PAYMENTS}`
    }
}

const module = function (namespace) {
    const { name: payment, Name: Payments, NAME: PAYMENTS } = getName(`pending ${namespace} payments`)

    return {
        state: {
            pendingPayments: {}
        },

        mutations: {
            [`ADD_${PAYMENTS}`] (state, payment) {
                const { address, amount } = payment

                state.pendingPayments = {
                    ...state.pendingPayments,
                    [address]: {
                        ...payment,
                        amountAsBaseCoin: convertToCoin(amount),
                        sent: false
                    }
                }
            },

            [`CLEAR_${PAYMENTS}`] (state) {
                state.pendingPayments = {}
            }
        },

        actions: {
            [`ADD_${PAYMENTS}`] ({ commit }, payment) {
                commit(`ADD_${PAYMENTS}`, payment)
            },

            [`CLEAR_${PAYMENTS}`] ({ commit }, payment) {
                commit(`CLEAR_${PAYMENTS}`, payment)
            }
        },

        getters: {
            [payment]: (state) => Object.values(state.pendingPayments),
            [`${payment}Size`]: (state, getters) => getters[payment].length,
            [`has${Payments}`]: (state, getter) => !!getter[`${[payment]}Size`],
            [`${payment}Amount`]: (state, getters) => getters[payment].reduce((accumulator, payment) => {
                return accumulator + (payment.cost || payment.amount)
            }, 0)
        }
    }
}

export default {
    types,
    module
}
