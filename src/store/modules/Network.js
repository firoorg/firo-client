import { sleep } from '../../lib/utils'
import * as types from '../types/Network'

const state = {
    isConnected: false,
    connectionErrorCode: 0
}

const mutations = {
    [types.NETWORK_IS_CONNECTED] (state) {
        state.isConnected = true
    },

    [types.NETWORK_CONNECTION_LOST] (state) {
        state.isConnected = false
    },

    [types.SET_NETWORK_CONNECTION_ERROR] (state, errorCode) {
        state.connectionErrorCode = errorCode
    }
}

const actions = {
    [types.NETWORK_IS_CONNECTED] ({ commit, state }) {
        if (!state.isConnected) {
            commit(types.NETWORK_IS_CONNECTED)
        }
    },

    [types.SET_NETWORK_CONNECTION_ERROR] ({ commit, state }, errorCode) {
        if (state.connectionErrorCode === errorCode) {
            return
        }

        commit(types.SET_NETWORK_CONNECTION_ERROR, errorCode)
    },

    // todo delay connection lost commitment to prevent flickering of the "not connected view"
    async [types.NETWORK_CONNECTION_LOST] ({ commit }) {
        await sleep(500)

        if (state.isConnected) {
            commit(types.NETWORK_CONNECTION_LOST)
        }
    }
}

const getters = {
    isConnected: (state) => state.isConnected,
    connectionError: (state) => state.connectionErrorCode ? state.connectionErrorCode : false
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
