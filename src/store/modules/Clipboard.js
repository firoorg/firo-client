import * as types from '../types/Clipboard'

const state = {
    // currentDenominations: {},
    clipboardValue: '',
    timestamp: null,
    notified: false
}

const mutations = {
    [types.SET_CLIPBOARD] (state, value) {
        state.clipboardValue = value
        state.timestamp = Date.now()
        state.notified = false
    },

    [types.SET_CLIPBOARD_NOTIFIED] (state, value) {
        state.notified = value
    }
}

const actions = {
    [types.SET_CLIPBOARD] ({ commit, state }, value) {
        commit(types.SET_CLIPBOARD, value)
    },

    [types.MARK_AS_NOTIFIED] ({ commit, state }) {
        if (state.clipboardValue && !state.notified) {
            commit(types.SET_CLIPBOARD_NOTIFIED, true)
        }
    }
}

const getters = {
    isNotified: (state) => state.notified
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
