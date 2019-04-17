import * as types from '../types/Clipboard'
import { isZcoinAddress } from '#/lib/zcoin'

const state = {
    // currentDenominations: {},
    clipboardValue: '',
    address: null,
    amount: 0,
    message: null,
    timestamp: null,
    notified: false
}

const mutations = {
    [types.SET_CLIPBOARD] (state, value) {
        state.clipboardValue = value

        state.address = null
        state.amount = 0
        state.message = null

        state.timestamp = Date.now()
        state.notified = false
    },

    [types.SET_ADDRESS] (state, value) {
        state.address = value
    },

    [types.SET_AMOUNT] (state, value) {
        state.amount = value
    },

    [types.SET_MESSAGE] (state, value) {
        state.message = value
    },

    [types.SET_CLIPBOARD_NOTIFIED] (state, value) {
        state.notified = value
    }
}

const actions = {
    [types.SET_CLIPBOARD] ({ commit, dispatch }, value) {
        commit(types.SET_CLIPBOARD, value)
        dispatch(types.SET_ADDRESS, value)
    },

    [types.SET_ADDRESS] ({ commit, rootGetters }, value) {
        if (!isZcoinAddress(value, rootGetters['Settings/b58Prefixes'])) {
            return
        }

        commit(types.SET_ADDRESS, value)
    },

    [types.SET_AMOUNT] ({ commit }, value) {
        if (isNaN(value)) {
            return
        }

        commit(types.SET_AMOUNT, parseFloat(value))
    },

    [types.SET_MESSAGE] ({ commit }, value) {
        if (!value) {
            return
        }

        commit(types.SET_MESSAGE, value)
    },

    [types.MARK_AS_NOTIFIED] ({ commit, state }) {
        if (state.clipboardValue && !state.notified) {
            commit(types.SET_CLIPBOARD_NOTIFIED, true)
        }
    }
}

const getters = {
    isNotified: (state) => state.notified,
    address: (state) => state.address,
    amount: (state) => state.amount,
    message: (state) => state.message,
    canSend: (state, getters, rootState, rootGetters) => false,
    canSpend: (state, getters, rootState, rootGetters) => false,
    hasNewAddress: (state, getters) => !!getters.address && !getters.isNotified,
    hasIncomingPaymentRequest: (state, getters) => !!getters.incomingPaymentRequest,
    incomingPaymentRequest: (state, getters, rootState, rootGetters) => {
        const { address, amount, message } = getters

        if (!(address && (amount || message))) {
            return null
        }


        if (rootGetters['App/addressBelongsToWallet'](address)) {
            return
        }

        return {
            address,
            amount,
            message
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
