import * as types from 'store/types/AddressValidation'

const state = {
    address: '',
    amount: 0,
    label: ''
    // isValidated: true
}

const mutations = {
    [types.SET_ADDRESS_TO_VALIDATE] (state, { address, amount, label }) {
        state.address = address
        state.amount = amount
        state.label = label
    }
}

const actions = {
    [types.SET_ADDRESS_TO_VALIDATE] ({ commit, state }, { address, amount, label }) {
        if (state.address === address) {
            return
        }

        commit(types.SET_ADDRESS_TO_VALIDATE, { address, amount, label })
    },

    [types.SHOW_ADDRESS_VALIDATION] ({ dispatch, state }, { address, amount, label }) {
        if (!address) {
            return
        }

        dispatch(types.SET_ADDRESS_TO_VALIDATE, { address, amount, label })
        dispatch('Window/show', 'validateAddress', { root: true })
    }
}

const getters = {
    currentAddressToValidate: (state) => ({
        address: state.address,
        amount: state.amount,
        label: state.label
    })
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
