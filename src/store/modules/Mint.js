import * as types from '../types/Mint'

const state = {
    denominations: {
    }
}

const mutations = {
    [types.ADD_DENOMINATION] (state, denomination) {
        const name = 'denom-' + denomination
        if (state.denominations[name] === undefined) {
            state.denominations[name] = 0
        }

        state.denominations[name] = state.denominations[name] + 1
    },

    [types.REMOVE_DENOMINATION] (state, denomination) {
        const name = 'denom-' + denomination
        if (!state.denominations[name]) {
            return
        }

        state.denominations[name] = state.denominations[name] - 1
    }
}

const actions = {
    addDenomination ({ commit, state }, denomination) {
        commit(types.ADD_DENOMINATION, denomination)
    },

    removeDenomination ({ commit, state }, denomination) {
        commit(types.REMOVE_DENOMINATION)
    }
}

const getters = {
    denominations: (state) => state.denominations
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
