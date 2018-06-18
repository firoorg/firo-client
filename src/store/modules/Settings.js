import * as types from '../types/Settings'

const state = {
    blockchainLocation: ''
}

const mutations = {
    [types.SET_BLOCKCHAIN_LOCATION] (state, location) {
        state.blockchainLocation = location
    }
}

const actions = {
    [types.SET_BLOCKCHAIN_LOCATION] ({ commit, state }, { location }) {
        console.log('setting blockchain location', location)
        // todo test if location exists
        commit(types.SET_BLOCKCHAIN_LOCATION, location)
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
