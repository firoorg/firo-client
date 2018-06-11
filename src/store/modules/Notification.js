const state = {
    lastMessage: null,
    lastNotification: null
}

const mutations = {
    SHOW_MESSAGE (state, message) {
        state.lastMessage = message
    },

    SEND_NOTIFICATION (state, notification) {
        state.lastNotification = notification
    }
}

const actions = {
    showMessage ({commit, state}, message) {
        const {message: content} = message

        if (state.lastMessage && state.lastMessage.message === content) {
            return
        }
        commit('SHOW_MESSAGE', message)
    },
    sendNotification ({commit, state}, notification) {
        const {type, title, message: content} = notification

        if (state.lastNotification &&
            state.lastNotification.type === type &&
            state.lastNotification.title === title &&
            state.lastNotification.message === content
        ) {
            return
        }

        commit('SEND_NOTIFICATION', notification)
    }
}

const getters = {
    lastMessage: (state) => state.lastMessage,
    lastNotification: (state) => state.lastNotification
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
