import * as types from '../types/PaymentRequest'
import { convertToCoin, convertToSatoshi } from '#/lib/convert'

const state = {
    paymentRequests: {},
    createPaymentRequestForm: {
        amount: null,
        label: '',
        message: ''
    },
    isLoading: false,
    lastSeen: 'blockHeightAsInteger',
    currentPaymentRequest: null
}

const mutations = {
    // send create request to the api
    [types.CREATE_PAYMENT_REQUEST] () {},

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD] (state, { field, value }) {
        state.createPaymentRequestForm[field] = value
    },

    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },

    [types.ADD_PAYMENT_REQUEST] (state, request) {
        state.paymentRequests = {
            ...state.paymentRequests,
            [request.address]: request
        }
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch }, initialState) {
        console.log(initialState)

        for (let address in initialState) {
            dispatch(types.ADD_PAYMENT_REQUEST, {
                ...initialState[address],
                address
            })
        }
    },

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_LABEL] ({ commit, state }, value) {
        const field = 'label'

        if (state.createPaymentRequestForm[field] === value) {
            return
        }

        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, { field, value })
    },

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_AMOUNT] ({ commit, state }, value) {
        const field = 'amount'

        if (state.createPaymentRequestForm[field] === value) {
            return
        }

        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, {
            field,
            value: convertToSatoshi(value)
        })
    },

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_MESSAGE] ({ commit, state }, value) {
        const field = 'message'

        if (state.createPaymentRequestForm[field] === value) {
            return
        }

        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, { field, value })
    },

    [types.RESET_PAYMENT_REQUEST_CREATE_FORM] ({ dispatch }) {
        dispatch(types.SET_PAYMENT_REQUEST_CREATE_FORM_LABEL, '')
        dispatch(types.SET_PAYMENT_REQUEST_CREATE_FORM_AMOUNT, null)
        dispatch(types.SET_PAYMENT_REQUEST_CREATE_FORM_MESSAGE, '')
    },

    [types.CREATE_PAYMENT_REQUEST] ({ commit, state }) {
        const { label, amount, message } = state.createPaymentRequestForm

        commit(types.IS_LOADING, true)
        commit(types.CREATE_PAYMENT_REQUEST, {
            label,
            amount,
            message
        })
    },

    [types.ADD_PAYMENT_REQUEST] ({ commit, dispatch, state }, paymentRequest) {
        const { address, createdAt, amount, message, label } = paymentRequest

        commit(types.ADD_PAYMENT_REQUEST, {
            address,
            createdAt: createdAt * 1000,
            amount,
            message,
            label
        })

        // clean up form fields
        dispatch(types.RESET_PAYMENT_REQUEST_CREATE_FORM)
    }
}

const getters = {
    paymentRequests (state, getters, rootState, rootGetters) {
        let requests = []
        const walletAddresses = rootGetters['Address/walletAddresses']

        console.log(rootState, rootGetters)

        for (var key in state.paymentRequests) {
            const { amount: amountRequested } = state.paymentRequests[key]
            const address = walletAddresses.filter((addr) => addr.address === key).pop()

            let transactionsReceived = 0
            let isFulfilled = false
            let isReused = false

            // address found in wallet addresses. validating status
            if (address) {
                const { transactions, isReused: addressIsReused } = address

                transactionsReceived = !!transactions.length
                isReused = addressIsReused

                if (transactionsReceived) {
                    const received = transactions.reduce((accumulator, tx) => {
                        return accumulator + tx.amount
                    }, 0)

                    if (received >= amountRequested) {
                        isFulfilled = true
                    }
                }
            }

            requests.push({
                ...state.paymentRequests[key],
                isFulfilled,
                isReused,
                transactionsReceived
            })
        }

        return requests
    },
    isLoading (state) {
        return state.isLoading
    },
    createFormLabel (state) {
        return state.createPaymentRequestForm.label
    },
    createFormAmount (state) {
        return state.createPaymentRequestForm.amount
    },
    createFormAmountAsBaseCoin (state) {
        return convertToCoin(state.createPaymentRequestForm.amount)
    },
    createFormMessage (state) {
        return state.createPaymentRequestForm.message
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
