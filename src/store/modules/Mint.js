import Vue from 'vue'
import * as types from '~/types/Mint'
import allTypes from '~/types'

import IsLoading from '~/mixins/IsLoading'
import Response from '~/mixins/Response'

import { formatDenominationPairs } from '~/utils'
import { convertToCoin, convertToSatoshi } from '#/lib/convert'

const isLoading = IsLoading.module('')
const mintResponse = Response.module('mint')

const state = {
    ...isLoading.state,
    ...mintResponse.state,

    currentDenominations: {},
    mints: {}
}

const mutations = {
    ...isLoading.mutations,
    ...mintResponse.mutations,

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
    ...mintResponse.actions,

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
        const { id, txid } = mint

        commit(types.UPDATE_MINT, {
            id: id || txid,
            ...mint
        })
    },

    [types.DO_MINT] ({ commit, dispatch, state }, { denominations, auth }) {
        console.log(denominations, auth)

        commit(types.DO_MINT, {
            data: {
                denominations
            },
            auth: {
                ...auth
            }
        })

        dispatch(allTypes.app.CLEAR_PASSPHRASE, null, { root: true })
    }
}

const getters = {
    ...isLoading.getters,
    ...mintResponse.getters,

    currentDenominations (state) {
        return state.currentDenominations
    },

    currentDenominationsFormatted (state, getters) {
        if (!getters.currentDenominations) {
            return []
        }

        return formatDenominationPairs(getters.currentDenominations)
    },

    currentDenominationCosts (state, getters) {
        return getters.currentDenominationsFormatted
            .reduce((accumulator, current) => accumulator + current.cost, 0)
    },

    currentDenominationCostsInSatoshi (state, getters) {
        return convertToSatoshi(getters.currentDenominationCosts)
    },

    currentDenominationFees (state, getters) {
        return getters.currentDenominationsFormatted.reduce((accumulator, denom) => {
            return accumulator + (denom.amount * 100000)
        }, 0)
    },

    mints (state, getters, rootState, rootGetters) {
        return Object.values(state.mints)
            .filter((mint) => !mint.used)
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

    confirmedMintPairs (state, getters) {
        let pairs = {}

        getters.mints.forEach((mint) => {
            const { amount } = mint
            const denom = `${amount / 100000000}`

            pairs[denom] = !pairs[denom] ? 1 : pairs[denom] + 1
        })

        return pairs
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
            .filter((mint) => !mint.used)
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
