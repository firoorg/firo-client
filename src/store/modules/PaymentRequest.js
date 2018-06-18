import * as types from '../types/PaymentRequest'

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
    [types.SET_PAYMENT_REQUEST_CREATE_FORM_LABEL] ({ commit }, value) {
        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, { field: 'label', value })
    },

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_AMOUNT] ({ commit }, value) {
        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, { field: 'amount', value })
    },

    [types.SET_PAYMENT_REQUEST_CREATE_FORM_MESSAGE] ({ commit }, value) {
        commit(types.SET_PAYMENT_REQUEST_CREATE_FORM_FIELD, { field: 'message', value })
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
        // todo check if already exists
        commit(types.ADD_PAYMENT_REQUEST, paymentRequest)

        // clean up form fields
        dispatch(types.RESET_PAYMENT_REQUEST_CREATE_FORM)
    }
}

const getters = {
    paymentRequests (state) {
        let requests = []

        for (var key in state.paymentRequests) {
            requests.push(state.paymentRequests[key])
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
