import Vue from 'vue'
import * as types from '../types/Mint'

const state = {
    currentDenominations: {},
    mints: []
}

const mutations = {
    [types.ADD_DENOMINATION] (state, denomination) {
        const name = `${denomination}`
        if (state.currentDenominations[name] === undefined) {
            Vue.set(state.currentDenominations, name, 0)
        }

        state.currentDenominations[name] = state.currentDenominations[name] + 1
    },

    [types.REMOVE_DENOMINATION] (state, denomination) {
        const name = `${denomination}`
        if (!state.currentDenominations[name]) {
            return
        }

        state.currentDenominations[name] = state.currentDenominations[name] - 1
    }
}

const actions = {
    [types.ADD_DENOMINATION] ({ commit, state }, denomination) {
        commit(types.ADD_DENOMINATION, denomination)
    },

    [types.REMOVE_DENOMINATION] ({ commit, state }, denomination) {
        commit(types.REMOVE_DENOMINATION, denomination)
    }
}

const getters = {
    currentDenominations (state) {
        return state.currentDenominations
    },

    mints (state) {
        return state.mints
            .filter((mint) => !mint.isUsed)
            .reduce((accumulator, mint) => {
                const { denomination } = mint

                if (!accumulator[`${denomination}`]) {
                    accumulator[`${denomination}`] = 0
                }

                accumulator[`${denomination}`]++

                return accumulator
            }, {})
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
