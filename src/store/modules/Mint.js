import Vue from 'vue'
import * as types from '../types/Mint'
import { convertToCoin } from '#/lib/convert'

const state = {
    currentDenominations: {},
    mints: {}
}

const mutations = {
    [types.DO_MINT] () {},

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

    [types.RESET_DENOMINATIONS] (state) {
        state.currentDenominations = {}
    },

    [types.UPDATE_MINT] (state, mint) {
        const { id } = mint
        // console.log(id, mint)
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

    [types.RESET_DENOMINATIONS] ({ commit, state }) {
        if (!Object.keys(state.currentDenominations).length) {
            return
        }

        commit(types.RESET_DENOMINATIONS)
    },

    [types.UPDATE_MINT] ({ commit, state }, mint) {
        const { id, txid, used } = mint

        commit(types.UPDATE_MINT, {
            isUsed: used,
            id: id || txid,
            ...mint
        })
    },

    [types.DO_MINT] ({ commit, state }, { denominations }) {
        console.log(denominations)

        commit(types.DO_MINT, {
            denominations
        })
        // console.log('sending mint', denominations)
    }
}

const getters = {
    currentDenominations (state) {
        return state.currentDenominations
    },

    mints (state, getters, rootState, rootGetters) {
        return Object.values(state.mints)
            .filter((mint) => !mint.isUsed)
            .map((mint) => {
                const { block } = mint
                const currentBlockHeight = rootGetters['Blockchain/currentBlockHeight']
                const confirmations = currentBlockHeight && block && block.height ? currentBlockHeight - block.height : 0

                return {
                    ...mint,
                    confirmations
                }
            })
    },

    confirmedMints (state, getters) {
        return getters.mints.filter((mint) => mint.confirmations >= 6)
    },

    confirmedMintsPerDenomination (state, getters) {
        return getters.confirmedMints.reduce((accumulator, mint) => {
            const { amount } = mint
            const label = parseInt(convertToCoin(amount))

            if (!accumulator[`${label}`]) {
                accumulator[`${label}`] = 0
            }

            accumulator[`${label}`]++

            return accumulator
        }, {})
    },

    mintsInProgress (state, getters) {
        return getters.mints
            .filter((mint) => !mint.isUsed)
            .filter((mint) => !mint.confirmations || mint.confirmations < 6)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
