import * as types from '~/types/Znode'

const state = {}

const mutations = {
}

const actions = {
    [types.SET_INITIAL_STATE] ({ commit, state }, initialState) {
        console.log('got initial state from ZNODE')
        console.log(initialState)
    }
}

const getters = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
