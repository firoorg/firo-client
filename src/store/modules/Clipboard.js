const state = {
    // currentDenominations: {},
    clipboardValue: '',
    timestamp: null
}

const mutations = {
    SET_CLIPBOARD (state, value) {
        state.clipboardValue = value
        state.timestamp = Date.now()
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
