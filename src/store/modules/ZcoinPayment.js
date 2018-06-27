import * as types from '../types/ZcoinPayment'

const state = {
    pendingPayments: {},
    selectedFee: {},
    availableFees: [],
    addPaymentForm: {
        amount: null,
        label: '',
        address: ''
    },
    isLoading: false,
    lastSeen: 'blockHeightAsInteger'
}

const mutations = {
    [types.SET_AVAILABLE_FEES] (state, availableFees) {
        console.log('setting available fees')
        state.availableFees = availableFees
    },

    [types.SET_FEE] (state, fee) {
        state.selectedFee = fee
    },

    [types.SET_FORM_LABEL] (state, label) {
        state.addPaymentForm.label = label
    },

    [types.SET_FORM_AMOUNT] (state, amount) {
        state.addPaymentForm.amount = amount
    },

    [types.SET_FORM_ADDRESS] (state, address) {
        state.addPaymentForm.address = address
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch }, initialState = {}) {
        const { availableFees } = initialState

        if (!availableFees) {
            console.warn('No fees provided in initial state')
            return
        }

        dispatch(types.SET_AVAILABLE_FEES, availableFees)
        dispatch(types.SET_FEE, Object.keys(availableFees)[0])
    },

    [types.SET_FORM_LABEL] ({ commit, getters }, value) {
        // todo check via getter

        commit(types.SET_FORM_LABEL, value)
    },

    [types.SET_FORM_AMOUNT] ({ commit, state }, value) {
        // todo check via getter

        commit(types.SET_FORM_AMOUNT, value)
    },

    [types.SET_FORM_ADDRESS] ({ commit, state }, value) {
        // todo check via getter

        console.log('address value', value)

        commit(types.SET_FORM_ADDRESS, value)
    },

    [types.SET_FEE] ({ commit, state }, fee) {
        const { key } = fee

        if (state.selectedFee === key) {
            return false
        }

        commit(types.SET_FEE, key)
    }
}

const getters = {
    availableFees: (state) => state.availableFees,
    selectedFee: (state) => ({
        ...state.availableFees[state.selectedFee],
        key: state.selectedFee
    }),
    isLoading: (state) => state.isLoading,

    createFormLabel: (state) => state.addPaymentForm.label,
    createFormAmount: (state) => state.addPaymentForm.amount,
    createFormAddress: (state) => state.addPaymentForm.address
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
