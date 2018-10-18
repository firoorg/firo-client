import fs from 'fs'
import allTypes from '~/types'
import * as types from '../types/Settings'

import { convertToSatoshi, getDenominationsToMint } from '#/lib/convert'

import Debug from 'debug'
const debug = Debug('zcoin:store:settings')

const state = {
    blockchainLocation: '',
    b58Prefixes: {
        mainnet: {
            pubkeyAddress: 82, // ['a', 'Z'],
            scriptAddress: 7 // ['3', '4']
        },
        testnet: {
            pubkeyAddress: 65, // ['T'],
            scriptAddress: 178 // ['2']
        }
    },
    percentageToHoldInZerocoin: 0.5,
    xzcZerocoinRatioNotified: 0
}

const mutations = {
    [types.SET_BLOCKCHAIN_LOCATION] (state, location) {
        state.blockchainLocation = location
    },

    [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] (state, percentage) {
        state.percentageToHoldInZerocoin = percentage
    },

    [types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED] (state, ratio) {
        state.xzcZerocoinRatioNotified = ratio
    }
}

const actions = {
    [types.SET_BLOCKCHAIN_LOCATION] ({ commit, state }, { location }) {
        if (!location) {
            return
        }

        if (!fs.existsSync(location)) {
            debug('given location does not exits', location)
            return
        }

        // todo: could potentially watch the location to catch cases where the user freakes out and...
        // todo: ...moves the folder while zcoin is running

        commit(types.SET_BLOCKCHAIN_LOCATION, location)
    },

    [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] ({ commit, state }, value) {
        const percentage = value / 100

        if (state.percentageToHoldInZerocoin === percentage) {
            return
        }

        if (percentage > 1 || percentage < 0) {
            return
        }

        commit(types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN, percentage)
        commit(types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED, -1)
    },

    [types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED] ({ commit, state, rootGetters }) {
        const ratio = rootGetters['Balance/xzcZerocoinRatio']

        if (state.xzcZerocoinRatioNotified === ratio) {
            return
        }

        commit(types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED, ratio)
    },

    [types.FILL_UP_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] ({ dispatch, getters, rootGetters }) {
        console.log(getters.suggestedMintsToFulfillRatio)
        const currentDenomination = rootGetters['Mint/currentDenominations']

        Object.entries(getters.suggestedMintsToFulfillRatio).forEach((pairs) => {
            const [ denom, amount ] = pairs
            const current = currentDenomination[denom] ? currentDenomination[denom] : 0

            for (let i = 0; i < amount - current; i++) {
                dispatch(allTypes.mint.ADD_DENOMINATION, denom, {
                    root: true
                })
                // this.addDenomination(denom)
            }
        })
    }
}

const getters = {
    blockchainLocation: (state) => state.blockchainLocation,
    hasBlockchainLocation: (state, getters) => !!getters.blockchainLocation,
    percentageToHoldInZerocoin: (state) => state.percentageToHoldInZerocoin * 100,
    isOutOfPercentageToHoldInZerocoinRange: (state, getters, rootState, rootGetters) => {
        const currentRatio = rootGetters['Balance/confirmedXzcZerocoinRatio']
        const offset = 0.05

        // upper bound
        /*
        if (state.percentageToHoldInZerocoin > currentRatio + offset) {
            return true
        } else
        */
        if (state.percentageToHoldInZerocoin > currentRatio + offset) {
            return true
        }

        return false
    },
    isOutOfPercentageToHoldInZerocoin (state, getters, rootState, rootGetters) {
        return getters.isOutOfPercentageToHoldInZerocoinRange &&
            rootGetters['Balance/availableXzc'] > convertToSatoshi(10)
    },
    showIsOutOfPercentageToHoldInZerocoinNotification (state, getters, rootState, rootGetters) {
        return getters.isOutOfPercentageToHoldInZerocoin &&
            rootGetters['Balance/xzcZerocoinRatio'] !== state.xzcZerocoinRatioNotified
    },
    remainingXzcToFulFillPercentageToHoldInZerocoin (state, getters, rootState, rootGetters) {
        return Math.floor((rootGetters['Balance/availableXzc'] * (state.percentageToHoldInZerocoin - rootGetters['Balance/confirmedXzcZerocoinRatio'])) / 100000000)
    },

    suggestedMintsToFulfillRatio (state, getters) {
        const { toMint } = getDenominationsToMint(getters.remainingXzcToFulFillPercentageToHoldInZerocoin)

        return toMint
    },
    b58Prefixes: (state, getters, rootState, rootGetters) => {
        // networkIdentifier
        const testOrMainNet = rootState.Blockchain.testnet ? 'testnet' : 'mainnet'

        return state.b58Prefixes[testOrMainNet]
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
