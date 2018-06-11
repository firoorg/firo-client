import { sleep } from '../../lib/utils'
import * as types from '../types/Network'

const state = {
    height: 0,
    timestamp: 0,
    isConnected: false
}

const mutations = {
    [types.NETWORK_IS_CONNECTED] (state) {
        state.isConnected = true
    },

    [types.NETWORK_CONNECTION_LOST] (state) {
        state.isConnected = false
    },

    [types.BLOCKCHAIN_HEADERS_UPDATE] (state, data) {
        console.log(types.BLOCKCHAIN_HEADERS_UPDATE, data)
        const {block_height: height, timestamp} = data

        state.height = height
        state.timestamp = timestamp
    }
}

const actions = {
    [types.NETWORK_IS_CONNECTED] ({ commit }) {
        commit(types.NETWORK_IS_CONNECTED)
    },

    // todo delay connection lost commitment to prevent flickering of the "not connected view"
    async [types.NETWORK_CONNECTION_LOST] ({ commit }) {
        await sleep(500) // todo test sleeping

        commit(types.NETWORK_CONNECTION_LOST)
    },

    // todo if it really gets called... or generic in lib/network...
    [types.SUBSCRIBE_TO_ADDRESS] (state, address) {
        console.log('network will subscribe to address', address)
    }
    /*
    someAsyncTask ({ commit }) {
      // do something async
      commit('INCREMENT_MAIN_COUNTER')
    }
    */
}

const getters = {
    height: (state) => state.height,
    isConnected: (state) => state.isConnected
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
