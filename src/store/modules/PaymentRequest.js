import * as types from '../types/PaymentRequest'
import { convertToCoin, convertToSatoshi } from '#/lib/convert'
import { getLabelForPaymentRequest } from '~/utils/i18n'

import IsLoading from '~/mixins/IsLoading'
import LastSeen from '~/mixins/LastSeen'

const isLoading = IsLoading.module('')
const lastSeen = LastSeen.module('payment request')

const state = {
    ...isLoading.state,
    ...lastSeen.state,

    paymentRequests: {},
    createPaymentRequestForm: {
        amount: null,
        label: '',
        message: ''
    },
    currentPaymentRequest: null
}

const mutations = {
    ...isLoading.mutations,
    ...lastSeen.mutations,

    // send create request to the api
    [types.CREATE_PAYMENT_REQUEST] () {},

    // send update label request to the API
    [types.UPDATE_PAYMENT_REQUEST_LABEL] () {},

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD] (state, { field, value }) {
        state.createPaymentRequestForm[field] = value
    },

    [types.ADD_PAYMENT_REQUEST] (state, request) {
        state.paymentRequests = {
            ...state.paymentRequests,
            [request.address]: request
        }
    }
}

const actions = {
    ...lastSeen.actions,

    [types.SET_INITIAL_STATE] ({ dispatch }, initialState) {
        console.log(initialState)

        for (let address in initialState) {
            if (address.charAt(0) === '_') {
                continue
            }

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
            createdAt,
            amount,
            message,
            label
        })

        // clean up form fields
        dispatch(types.RESET_PAYMENT_REQUEST_CREATE_FORM)
    },

    [types.UPDATED_PAYMENT_REQUEST] ({ commit, dispatch, state }, paymentRequest) {
        const { address, createdAt, amount, message, label } = paymentRequest

        const paymentRequestToUpdate = getters.getPaymentRequestForAddress(address)

        if (!paymentRequestToUpdate) {
            return
        }

        commit(types.ADD_PAYMENT_REQUEST, {
            address,
            createdAt,
            amount,
            message,
            label
        })
    },

    [types.UPDATE_PAYMENT_REQUEST_LABEL] ({ commit, state, getters }, { label, address }) {
        const paymentRequestToUpdate = getters.getPaymentRequestForAddress(address)

        if (!paymentRequestToUpdate) {
            return
        }

        if (paymentRequestToUpdate.label === label) {
            return
        }

        commit(types.UPDATE_PAYMENT_REQUEST_LABEL, {
            label,
            address
        })
    }
}

const getters = {
    ...isLoading.getters,
    ...lastSeen.getters,

    paymentRequests (state, getters, rootState, rootGetters) {
        let requests = []
        const walletAddresses = rootGetters['Address/walletAddresses']

        for (let key in state.paymentRequests) {
            const { amount: amountRequested } = state.paymentRequests[key]
            const address = walletAddresses.find((addr) => addr.address === key)

            let transactionsReceived = false
            let isFulfilled = false
            let isIncoming = false
            let isReused = false

            let amountToDisplay = amountRequested

            // address found in wallet addresses. validating status
            if (address) {
                const { transactions, isReused: addressIsReused } = address

                transactionsReceived = !!transactions.length
                isReused = addressIsReused

                if (transactionsReceived) {
                    isIncoming = true

                    const received = transactions.reduce((accumulator, tx) => {
                        if (!tx.block) {
                            return accumulator
                        }

                        return accumulator + tx.amount
                    }, 0)

                    if (received >= amountRequested) {
                        isIncoming = false
                        isFulfilled = true
                        amountToDisplay = received
                    }
                }
            }

            const { createdAt } = state.paymentRequests[key]

            const updatedAt = transactions.reduce((accumulator, tx) => {
                return (tx.firstSeenAt > accumulator) ? tx.firstSeenAt : accumulator
            }, createdAt)

            requests.push({
                ...state.paymentRequests[key],
                amount: amountToDisplay,
                isFulfilled,
                isIncoming,
                isReused,
                transactionsReceived,
                updatedAt
            })
        }

        return requests
    },
    getPaymentRequestForAddress (state, getters) {
        return (address) => {
            return getters.paymentRequests.find((paymentRequest) => {
                console.log('paymentRequest.address', paymentRequest.address, address)
                return paymentRequest.address === address
            })
        }
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
    },

    virtualPaymentRequests (state, getters, rootState, rootGetters) {
        const paymentRequestsKeys = Object.keys(state.paymentRequests)
        const walletAddresses = rootGetters['Address/walletAddresses']
        let paymentRequests = []

        walletAddresses.forEach((walletAddress) => {
            const { address, transactions, total, isReused } = walletAddress

            if (!transactions.length) {
                return
            }

            // payment request for this address exists
            if (paymentRequestsKeys.includes(address)) {
                return
            }

            const isFulfilled = transactions.some((tx) => {
                // return tx.confirmations && tx.confirmations > 0
                return tx.isConfirmed
            })

            const createdAt = transactions.reduce((accumulator, tx) => {
                return (tx.firstSeenAt < accumulator) ? tx.firstSeenAt : accumulator
            }, Infinity)

            const updatedAt = transactions.reduce((accumulator, tx) => {
                return (tx.firstSeenAt > accumulator) ? tx.firstSeenAt : accumulator
            }, createdAt)

            const request = {
                address,
                isFulfilled,
                isReused,
                isIncoming: !isFulfilled,
                isVirtual: true,
                transactionsReceived: true,
                amount: total.balance,
                message: null,
                createdAt,
                updatedAt
            }

            const label = getLabelForPaymentRequest({
                request,
                transactions,
                rootState,
                rootGetters
            })

            paymentRequests.push({
                ...request,
                label
            })
        })

        return paymentRequests
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
