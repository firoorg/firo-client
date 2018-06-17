import * as types from '../types/PaymentRequest'

const state = {
    requests: []
}

const mutations = {
    [types.ADD_PAYMENT_REQUEST] (state, location) {
        state.blockchainLocation = location
    }
}

const actions = {
    createPaymentRequest ({ commit, state }, { label, amount, message }) {
        // commit(types.ADD_PAYMENT_REQUEST, location)
    }
}

const getters = {
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
