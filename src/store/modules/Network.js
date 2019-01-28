import Vue from 'vue'
import { sleep } from '../../lib/utils'
import * as types from '../types/Network'

const state = {
    isConnected: false,
    connectionSeemsLost: false,
    connectionErrorCode: 0
}

const mutations = {
    [types.NETWORK_IS_CONNECTED] (state) {
        Vue.set(state, 'isConnected', true)
        //state.isConnected = true
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
        if (!state.isConnected) {
            return
        }

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
    connectionLost: (state) => {
        return (state.connectionSeemsLost && state.isConnected === false)
    },
    connectionError: (state) => state.connectionErrorCode ? state.connectionErrorCode : false
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
