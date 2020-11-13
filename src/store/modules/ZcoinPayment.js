import * as types from 'store/types/FiroPayment'
import allTypes from 'store/types'
import { convertToCoin, convertToSatoshi } from 'lib/convert'

import IsLoading from 'store/mixins/IsLoading'
import Payments from 'store/mixins/Payments'
import Response from 'store/mixins/Response'

const isLoading = IsLoading.module('')
const pendingPayments = Payments.module('firo')

const sendFiroResponse = Response.module('send firo')

const state = {
    ...isLoading.state,
    ...pendingPayments.state,
    ...sendFiroResponse.state,

    selectedFee: 'fast',
    availableFees: {
        fast: 1000,
        medium: 500,
        slow: 100
    },
    addPaymentForm: {
        amount: null,
        label: '',
        address: '',
        totalTxFee: 1000
    },
    isSelectingCustomInputs: false,
    selectedUtxos: [],
    enteredAmount: 0,
    coinChanges: []
}

const mutations = {
    ...isLoading.mutations,
    ...pendingPayments.mutations,
    ...sendFiroResponse.mutations,

    [types.CALC_TX_FEE] () {},
    [types.SEND_ZCOIN] () {},

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
        state.availableFees = availableFees
    },

    [types.SET_FEE] (state, fee) {
        state.selectedFee = fee
    },

    [types.SET_TX_FEE] (state, txFee) {
        state.addPaymentForm.totalTxFee = txFee
    },

    [types.TOGGLE_CUSTOM_INPUTS_POPUP](state) {
        state.isSelectingCustomInputs = !state.isSelectingCustomInputs
    },
    [types.UPDATE_CUSTOM_INPUTS](state, inputs) {
        state.selectedUtxos = inputs
    },
    [types.UPDATE_COIN_LOCK](state, coinChanges) {
        state.coinChanges = coinChanges
    },
    [types.ENTERED_SEND_AMOUNT](state, amount) {
        state.enteredAmount = amount
    }
}

const actions = {
    ...pendingPayments.actions,
    ...sendFiroResponse.actions,

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


        commit(types.SET_FORM_ADDRESS, value)
    },

    [types.CLEAR_FORM] ({ dispatch }) {
        dispatch(types.SET_FORM_LABEL, '')
        dispatch(types.SET_FORM_AMOUNT, null)
        dispatch(types.SET_FORM_ADDRESS, '')
    },

    [types.SET_FEE] ({ commit, state }, fee) {
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

    [types.UPDATE_CUSTOM_INPUTS] ({ commit }, { inputs }) {
        commit(types.UPDATE_CUSTOM_INPUTS, inputs)
    },

    [types.UPDATE_COIN_LOCK] ({ commit }, { coinChanges }) {
        commit(types.UPDATE_COIN_LOCK, coinChanges)
    },

    [types.ENTERED_SEND_AMOUNT] ({ commit }, { amount }) {
        commit(types.ENTERED_SEND_AMOUNT, amount)
    },

    [types.SEND_ZCOIN] ({ dispatch, commit, state }, { payments, fee, auth }) {
        // const { address, amount } = payment

        commit(types.SEND_ZCOIN, {
            data: {
                payments: payments.map((payment) => ({
                    label: payment.label,
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
    },
    [types.TOGGLE_CUSTOM_INPUTS_POPUP]({ commit }) {
        commit(types.TOGGLE_CUSTOM_INPUTS_POPUP)
    },
    [types.UPDATE_CUSTOM_INPUTS]({ commit }, { inputs }) {
        commit(types.UPDATE_CUSTOM_INPUTS, inputs)
    },
    [types.UPDATE_COIN_LOCK]({ commit }, { coinChanges }) {
        commit(types.UPDATE_COIN_LOCK, coinChanges)
    },
}

const getters = {
    ...isLoading.getters,
    ...pendingPayments.getters,
    ...sendFiroResponse.getters,

    availableFees: (state) => state.availableFees,
    selectedFee: (state) => ({
        amount: state.availableFees[state.selectedFee],
        label: state.selectedFee
    }),

    createFormLabel: (state) => state.addPaymentForm.label,
    createFormAmount: (state) => state.addPaymentForm.amount,
    createFormAmountAsBaseCoin: (state) => convertToCoin(state.addPaymentForm.amount),
    createFormAddress: (state) => state.addPaymentForm.address,
    createFormIsEmpty: (state, getters) => (
        !getters.createFormLabel &&
        !getters.createFormAmount &&
        !getters.createFormAddress
    ),
    customInputs: (state) => state.isSelectingCustomInputs,
    selectedInputs: (state) => state.selectedUtxos,
    enteredAmount: (state) => state.enteredAmount,
    coinChanges: (state) => state.coinChanges
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
