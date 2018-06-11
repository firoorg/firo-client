import * as types from '../types/App'

const state = {
    showIntroScreen: false
}

const mutations = {
    [types.HIDE_INTRO_SCREEN] (state) {
        state.showIntroScreen = false
    }
}

const actions = {
    [types.HIDE_INTRO_SCREEN] ({ commit, state }) {
        console.log('in action')
        commit(types.HIDE_INTRO_SCREEN)
    }
}

const getters = {
    showIntroScreen: (state) => state.showIntroScreen
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
