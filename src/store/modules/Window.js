const state = {
    welcomeGuide: false,
    settings: false,
    validateAddress: false
}

const mutations = {
    SHOW_WINDOW (state, name) {
        state[name] = true
    },

    CLOSE_WINDOW (state, name) {
        state[name] = false
        // delete state[name]
    }
}

const actions = {
    show ({commit, state}, name) {
        if (state[name]) {
            return
        }

        commit('SHOW_WINDOW', name)
    },

    close ({commit, state}, name) {
        if (!state[name]) {
            return
        }

        commit('CLOSE_WINDOW', name)
    }
}

const getters = {
    hasOpenModal: (state) => {
        return (state.settings)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
