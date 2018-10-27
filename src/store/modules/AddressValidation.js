import * as types from '~/types/AddressValidation'

const state = {
    addressToValidate: ''
    // isValidated: true
}

const mutations = {
    [types.SET_ADDRESS_TO_VALIDATE] (state, address) {
        state.addressToValidate = address
    }
}

const actions = {
    [types.SET_ADDRESS_TO_VALIDATE] ({ commit, state }, address) {
        if (state.addressToValidate === address) {
            return
        }

        commit(types.SET_ADDRESS_TO_VALIDATE, address)
    },

    [types.SHOW_ADDRESS_VALIDATION] ({ dispatch, state }, address) {
        if (!address) {
            return
        }

        dispatch(types.SET_ADDRESS_TO_VALIDATE, address)
        dispatch('Window/show', 'validateAddress', { root: true })
    }
}

const getters = {
    currentAddressToValidate: (state) => state.addressToValidate
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
