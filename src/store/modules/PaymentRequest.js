import * as types from '../types/PaymentRequest'
import { convertToCoin, convertToSatoshi } from '#/lib/convert'
import { getLabelForPaymentRequest } from '~/utils/i18n'

import IsLoading from '~/mixins/IsLoading'
import LastSeen from '~/mixins/LastSeen'

import { createLogger } from '#/lib/logger'

const isLoading = IsLoading.module('')
const lastSeen = LastSeen.module('payment request')

const logger = createLogger('zcoin:store:paymentRequest')

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

    [types.ARCHIVE_PAYMENT_REQUEST] () {},

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
        logger.info('got initial payment request state %o', initialState)

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

        logger.info('creating payment request: %o', {
            label,
            amount,
            message
        })

        commit(types.CREATE_PAYMENT_REQUEST, {
            label,
            amount: amount || null,
            message
        })
    },

    [types.ADD_PAYMENT_REQUEST] ({ commit, dispatch, state }, paymentRequest) {
        const { address, createdAt, amount, message, label, state: prState } = paymentRequest

        commit(types.ADD_PAYMENT_REQUEST, {
            address,
            createdAt,
            amount,
            message,
            label,
            state: prState
        })

        // clean up form fields
        dispatch(types.RESET_PAYMENT_REQUEST_CREATE_FORM)
    },

    [types.UPDATED_PAYMENT_REQUEST] ({ commit, dispatch, state }, paymentRequest) {
        const { address, createdAt, amount, message, label, state: prState } = paymentRequest

        const paymentRequestToUpdate = getters.getPaymentRequestForAddress(address)

        if (!paymentRequestToUpdate) {
            return
        }

        commit(types.ADD_PAYMENT_REQUEST, {
            address,
            createdAt,
            amount,
            message,
            label,
            state: prState
        })
    },

    [types.UPDATE_PAYMENT_REQUEST_LABEL] ({ commit, state, getters }, { label, address, createdAt }) {
        const paymentRequestToUpdate = getters.getPaymentRequestForAddress(address)

        if (paymentRequestToUpdate && paymentRequestToUpdate.label === label) {
            return
        }

        commit(types.UPDATE_PAYMENT_REQUEST_LABEL, {
            label,
            createdAt,
            address
        })
    },

    [types.ARCHIVE_PAYMENT_REQUEST] ({ commit, state, getters }, address) {
        const paymentRequestToUpdate = getters.getPaymentRequestForAddress(address)

        if (!paymentRequestToUpdate) {
            logger.warn("No payment request found for address %s", address)
            return
        }

        commit(types.ARCHIVE_PAYMENT_REQUEST, address)
    }
}

const getters = {
    ...isLoading.getters,
    ...lastSeen.getters,

    paymentRequests (state, getters, rootState, rootGetters) {
        let requests = []
        const walletAddresses = rootGetters['Address/walletAddresses']

        for (let key in state.paymentRequests) {
            // key here is the address, and address is in fact data (such as transactions) *associated* with an address.
            // This terminology is consistent throughout the client, so I've let it be pending a refactor.
            const { amount: amountRequested, label } = state.paymentRequests[key]
            const address = walletAddresses.find((addr) => addr.address === key)

            const { createdAt } = state.paymentRequests[key]
            let updatedAt = createdAt

            let transactionsReceived = false
            let isFulfilled = false
            let isIncoming = false
            let isReused = false
            let lastSeen = getters.paymentRequestLastSeen(key) || createdAt

            let amountReceived = 0
            let amountPending = 0

            // address found in wallet addresses. validating status
            if (address) {
                const { transactions, isReused: addressIsReused } = address

                transactionsReceived = !!transactions.length
                isReused = addressIsReused

                if (transactionsReceived) {
                    isIncoming = true

                    for (const tx of transactions) {
                        if (tx.block) {
                            amountReceived += tx.amount
                        } else {
                            amountPending += tx.amount
                        }
                    }

                    if (amountReceived && amountReceived >= amountRequested) {
                        isIncoming = false
                        isFulfilled = true
                    }

                    updatedAt = transactions.reduce((accumulator, tx) => {
                        return (tx.firstSeenAt > accumulator) ? tx.firstSeenAt : accumulator
                    }, updatedAt)
                }
            }

            requests.push({
                ...state.paymentRequests[key],
                address: key,
                transactions: address ? address.transactions || [] : [],
                amountRequested,
                amountReceived,
                isFulfilled,
                isIncoming,
                isReused,
                transactionsReceived,
                updatedAt,
                lastSeen,
                amountPending,
                uniqId: `paymentRequest-${key}`,
                isUnseen: lastSeen < updatedAt
            })
        }

        return requests
    },
    getPaymentRequestForAddress (state, getters) {
        return (address) => {
            return getters.paymentRequests.find((paymentRequest) => {
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

    // One payment request per transaction, not per address.
    virtualPaymentRequests (state, getters, rootState, rootGetters) {
        const paymentRequestsKeys = Object.keys(state.paymentRequests)
        const walletAddresses = rootGetters['Address/walletAddresses']
        let paymentRequests = []

        walletAddresses.forEach((walletAddress) => {
            const { address, transactions } = walletAddress

            // payment request for this address exists
            if (paymentRequestsKeys.includes(address)) {
                return
            }

            for (const tx of transactions) {
                if (!tx.id) {
                    console.log(tx)
                }
                const request = {
                    isVirtual: true,
                    message: null,
                    transactions: [tx],
                    transactionsReceived: true,
                    address: address,
                    uniqId: `virtualPaymentRequest-${tx.id}`,
                    isFulfilled: !!tx.isConfirmed,
                    isReused: transactions.length > 1,
                    isIncoming: !tx.isConfirmed,
                    amountRequested: null,
                    amountReceived: tx.isConfirmed ? tx.amount : 0,
                    amountPending: tx.isConfirmed ? 0 : tx.amount,
                    // Yes, Infinity, not NaN... It makes sorting easier.
                    createdAt: tx.firstSeenAt || Infinity,
                    updatedAt: tx.firstSeenAt || Infinity
                }

                request.label = getLabelForPaymentRequest({request, rootState, rootGetters, transactions: [tx]})

                paymentRequests.push(request)
            }
        })

        return paymentRequests
    },

    allPaymentRequests (state, getters) {
        return [
            ...getters.paymentRequests,
            ...getters.virtualPaymentRequests
        ]
    },

    hasUnseenPaymentRequests (state, getters) {
        return !!getters.paymentRequestsWithUnseenChanges.length
    },

    paymentRequestsWithUnseenChanges (state, getters) {
        return getters.allPaymentRequests.filter(({ isUnseen }) => {
            return isUnseen
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
