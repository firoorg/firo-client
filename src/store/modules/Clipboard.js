const state = {
    // currentDenominations: {},
    clipboardValue: ''
}

const mutations = {
    SET_CLIPBOARD (state, value) {
        state.clipboardValue = value
    }
}

const actions = {
    setClipboard ({ commit, state }, value) {
        commit('SET_CLIPBOARD', value)
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
