import { sleep } from '../../lib/utils'
import * as types from '../types/Network'

const state = {
    isConnected: undefined,
    connectionSeemsLost: undefined,
    connectionErrorCode: 0
}

const mutations = {
    [types.NETWORK_IS_CONNECTED] (state) {
        state.isConnected = true
    },

    [types.NETWORK_CONNECTION_SEEMS_LOST] (state, value) {
        state.connectionSeemsLost = !!value
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
        if (state.connectionSeemsLost) {
            commit(types.NETWORK_CONNECTION_SEEMS_LOST, false)
        }

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

    async [types.NETWORK_CONNECTION_LOST] ({ commit, state }) {
        commit(types.NETWORK_CONNECTION_SEEMS_LOST, true)
        await sleep(500)

        // "connection seems lost" could be reset to false by now
        // if the heartbeat was just delayed for some reason.
        if (state.isConnected && state.connectionSeemsLost) {
            commit(types.NETWORK_CONNECTION_LOST)
        }
    }
}

const getters = {
    isConnected: (state) => state.isConnected === true,
    connectionLost: (state, getters) => state.connectionSeemsLost && !getters.isConnected,
    connectionError: (state) => state.connectionErrorCode ? state.connectionErrorCode : false
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
