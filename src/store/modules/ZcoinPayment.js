import * as types from '~/types/ZcoinPayment'
import allTypes from '~/types'
import { convertToCoin, convertToSatoshi } from '#/lib/convert'

import Payments from '~/mixins/Payments'
import Response from '~/mixins/Response'

const pendingPayments = Payments.module('zcoin')
const pendingPaymentTypes = Payments.types('zcoin')

const sendZcoinResponse = Response.module('send zcoin')

const state = {
    ...pendingPayments.state,
    ...sendZcoinResponse.state,

    selectedFee: {},
    availableFees: [],
    addPaymentForm: {
        amount: null,
        label: '',
        address: '',
        totalTxFee: 0
    },
    isLoading: false,
    lastSeen: 'blockHeightAsInteger'
}

const mutations = {
    ...pendingPayments.mutations,
    ...sendZcoinResponse.mutations,

    [types.CALC_TX_FEE] () {},
    [types.SEND_ZCOIN] () {},

    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },

    [types.SET_FORM_LABEL] (state, label) {
        state.addPaymentForm.label = label
    },

    [types.SET_FORM_AMOUNT] (state, amount) {
        state.addPaymentForm.amount = amount
    },

    [types.SET_FORM_ADDRESS] (state, address) {
        state.addPaymentForm.address = address
    },

    // --- Fee ---

    [types.SET_AVAILABLE_FEES] (state, availableFees) {
        console.log('setting available fees')
        state.availableFees = availableFees
    },

    [types.SET_FEE] (state, fee) {
        state.selectedFee = fee
    },

    [types.SET_TX_FEE] (state, txFee) {
        console.log('got new tx fee', txFee)
        state.addPaymentForm.totalTxFee = txFee
    }
}

const actions = {
    ...pendingPayments.actions,
    ...sendZcoinResponse.actions,

    [types.SET_AVAILABLE_FEES] ({ dispatch }, availableFees) {
        /*
        const { availableFees } = initialState

        if (!availableFees) {
            console.warn('No fees provided in initial state')
            return
        }
        */

        dispatch(types.SET_AVAILABLE_FEES, availableFees)
        dispatch(types.SET_FEE, Object.keys(availableFees)[0])
    },

    [types.SET_FORM_LABEL] ({ commit, getters }, value) {
        // todo check via getter

        commit(types.SET_FORM_LABEL, value)
    },

    [types.SET_FORM_AMOUNT] ({ commit, state }, value) {
        // todo check via getter

        commit(types.SET_FORM_AMOUNT, convertToSatoshi(value))
    },

    [types.SET_FORM_ADDRESS] ({ commit, state }, value) {
        // todo check via getter

        console.log('address value', value)

        commit(types.SET_FORM_ADDRESS, value)
    },

    [types.CLEAR_FORM] ({ dispatch }) {
        dispatch(types.SET_FORM_LABEL, '')
        dispatch(types.SET_FORM_AMOUNT, null)
        dispatch(types.SET_FORM_ADDRESS, '')
    },

    [types.SET_FEE] ({ commit, state }, fee) {
        console.log('setting fee', fee)
        const { key } = fee

        if (state.selectedFee === key) {
            return
        }

        commit(types.SET_FEE, key)
    },

    [types.CALC_TX_FEE] ({ commit }, { payments, fee }) {
        const paymentsMap = payments.map((payment) => ({
            amount: payment.amount,
            address: payment.address
        }))

        if (!paymentsMap.length) {
            return
        }

        commit(types.CALC_TX_FEE, {
            paymentsMap,
            fee
        })
    },

    [types.SET_TX_FEE] ({ commit }, { fee }) {
        commit(types.SET_TX_FEE, fee)
    },

    [types.SEND_ZCOIN] ({ dispatch, commit, state }, { payments, fee, auth }) {
        console.log('payment in action', payments, fee)
        // const { address, amount } = payment

        commit(types.SEND_ZCOIN, {
            data: {
                payments: payments.map((payment) => ({
                    amount: payment.amount,
                    address: payment.address
                })),
                fee: state.addPaymentForm.totalTxFee
            },
            auth: {
                ...auth
            }
        })

        dispatch(allTypes.app.CLEAR_PASSPHRASE, null, { root: true })
        // todo think about when to clear pending payments and if we're waiting for a
        // confirmation per payment/denomination we need some identifier which doesn't exist right now
        dispatch(pendingPaymentTypes.CLEAR_PENDING_ZCOIN_PAYMENTS)
    }

    /*
    [types.ON_SEND_ZCOIN_SUCCESS] ({ commit, dispatch, state }, response) {
        console.log(types.ON_SEND_ZCOIN_SUCCESS)
        console.log(response)

        commit(types.SET_SEND_ZCOIN_RESPONSE, response)
    },

    [types.ON_SEND_ZCOIN_ERROR] ({ commit, dispatch, state }, response) {
        console.log(types.ON_SEND_ZCOIN_ERROR)
        console.log(response)

        try {
            commit(types.SET_SEND_ZCOIN_RESPONSE, response)
        } catch (e) {
            console.log(e)
        }
    }
    */
}

const getters = {
    ...pendingPayments.getters,
    ...sendZcoinResponse.getters,

    availableFees: (state) => state.availableFees,
    selectedFee: (state) => ({
        ...state.availableFees[state.selectedFee],
        key: state.selectedFee
    }),
    isLoading: (state) => state.isLoading,

    createFormLabel: (state) => state.addPaymentForm.label,
    createFormAmount: (state) => state.addPaymentForm.amount,
    createFormAmountAsBaseCoin: (state) => convertToCoin(state.addPaymentForm.amount),
    createFormAddress: (state) => state.addPaymentForm.address,
    createFormIsEmpty: (state, getters) => (
        !getters.createFormLabel &&
        !getters.createFormAmount &&
        !getters.createFormAddress
    )
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
