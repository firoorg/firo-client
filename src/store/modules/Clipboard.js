const state = {
    // currentDenominations: {},
    clipboardValue: '',
    timestamp: null,
    notified: false
}

const mutations = {
    SET_CLIPBOARD (state, value) {
        state.clipboardValue = value
        state.timestamp = Date.now()
        state.notified = false
    },

    SET_CLIPBOARD_NOTIFIED (state, value) {
        state.notified = value
    }
}

const actions = {
    setClipboard ({ commit, state }, value) {
        commit('SET_CLIPBOARD', value)
    },

    markAsNotified ({ commit, state }) {
        if (state.clipboardValue && !state.notified) {
            commit('SET_CLIPBOARD_NOTIFIED', true)
        }
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
