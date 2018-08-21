import * as types from '../types/App'

const state = {
    clientIsLocked: false,
    showIntroScreen: true,
    passphrase: null
}

const mutations = {
    [types.SET_CLIENT_LOCKED] (state, isLocked) {
        state.clientIsLocked = isLocked
    },

    [types.HIDE_INTRO_SCREEN] (state) {
        state.showIntroScreen = false
    },

    [types.SET_CURRENT_PASSPHRASE] (state, passphrase) {
        state.passphrase = passphrase
    },

    [types.CLEAR_PASSPHRASE] (state) {
        state.passphrase = null
    }
}

const actions = {
    [types.SET_CLIENT_LOCKED] ({ commit, state }, isLocked) {
        if (state.clientIsLocked === isLocked) {
            return
        }

        commit(types.SET_CLIENT_LOCKED, isLocked)
    },

    [types.HIDE_INTRO_SCREEN] ({ commit, state }) {
        console.log('in action')
        commit(types.HIDE_INTRO_SCREEN)
    },

    [types.SET_CURRENT_PASSPHRASE] ({ commit, state }, passphrase) {
        if (state.passphrase === passphrase) {
            return
        }

        commit(types.SET_CURRENT_PASSPHRASE, passphrase)
    },

    [types.CLEAR_PASSPHRASE] ({ commit }) {
        commit(types.CLEAR_PASSPHRASE)
    }
}

const getters = {
    showIntroScreen: (state) => state.showIntroScreen,
    isLocked: (state) => state.clientIsLocked,
    hasOpenOverlay (state, getters, rootState, rootGetters) {
        console.log(rootGetters)
        const windowHasOpenModal = rootGetters['Window/hasOpenModal']
        const networkIsConnected = rootGetters['Network/isConnected']
        const networkConnectionError = rootGetters['Network/ConnectionError']

        return windowHasOpenModal ||
            !networkIsConnected ||
            getters.showIntroScreen ||
            networkConnectionError
    },
    currentPassphrase: (state) => state.passphrase
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
