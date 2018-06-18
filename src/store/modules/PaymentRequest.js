import * as types from '../types/PaymentRequest'

const state = {
    requests: []
}

const mutations = {
    [types.CREATE_PAYMENT_REQUEST] () {},

    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },

    [types.ADD_PAYMENT_REQUEST] (state, request) {
        state.requests = [
            ...state.requests,
            request
        ]
    }
}

const actions = {
    [types.CREATING_PAYMENT_REQUEST] ({ commit, state }) {

    },

    [types.CREATE_PAYMENT_REQUEST] ({ commit, state }, { label, amount, message }) {
        console.log('huhuu@createPaymentRequest')
        commit(types.IS_LOADING, true)
        commit(types.CREATE_PAYMENT_REQUEST, { label, amount, message })
    },

    [types.ADD_PAYMENT_REQUEST] ({ commit, state }, paymentRequest) {
        // todo check if already exists
        commit(types.ADD_PAYMENT_REQUEST, paymentRequest)
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
