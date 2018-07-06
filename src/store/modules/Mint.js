import Vue from 'vue'
import * as types from '../types/Mint'

const state = {
    currentDenominations: {},
    mints: {}
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
    },

    [types.UPDATE_MINT] (state, mint) {
        const { id } = mint
        console.log(id, mint)
        Vue.set(state.mints, id, mint)
    }
}

const actions = {
    [types.ADD_DENOMINATION] ({ commit, state }, denomination) {
        commit(types.ADD_DENOMINATION, denomination)
    },

    [types.REMOVE_DENOMINATION] ({ commit, state }, denomination) {
        commit(types.REMOVE_DENOMINATION, denomination)
    },

    [types.UPDATE_MINT] ({ commit, state }, mint) {
        const { id, txid, used } = mint

        commit(types.UPDATE_MINT, {
            isUsed: used,
            id: id || txid,
            ...mint
        })
    }
}

const getters = {
    currentDenominations (state) {
        return state.currentDenominations
    },

    // todo rename to confirmed mints
    mints (state) {
        return Object.values(state.mints)
            .filter((mint) => !mint.isUsed)
            .filter((mint) => mint.confirmations >= 6)
            .reduce((accumulator, mint) => {
                const { amount } = mint

                if (!accumulator[`${amount}`]) {
                    accumulator[`${amount}`] = 0
                }

                accumulator[`${amount}`]++

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
