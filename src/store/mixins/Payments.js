import { convertToCoin } from '#/lib/convert'

const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const getName = (namespace) => {
    const name = `pending${ucfirst(namespace)}Payments`
    const Name = ucfirst(name)
    const NAME = `PENDING_${namespace.toUpperCase()}_PAYMENTS`

    return {
        name,
        Name,
        NAME
    }
}

const types = function (namespace) {
    const { NAME: PAYMENTS } = getName(namespace)

    return {
        [`ADD_${PAYMENTS}`]: `ADD_${PAYMENTS}`
    }
}

const module = function (namespace = '') {
    const { name: payment, Name: Payments, NAME: PAYMENTS } = getName(namespace)

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
            }
        },

        actions: {
            TESTING () {
                console.log('testing')
            },

            [`ADD_${PAYMENTS}`] ({ commit }, payment) {
                console.log('yes, works!')

                commit(`ADD_${PAYMENTS}`, payment)
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
