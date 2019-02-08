import { format } from 'util'

import allTypes from '~/types'
import * as types from '../types/Settings'
import { getAppSettings } from '#/lib/utils'

import { convertToSatoshi, getDenominationsToMint } from '#/lib/convert'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store:settings')

const state = {
    //blockchainLocation: '',
    b58Prefixes: {
        main: {
            pubkeyAddress: 82, // ['a', 'Z'],
            scriptAddress: 7 // ['3', '4']
        },
        test: {
            pubkeyAddress: 65, // ['T'],
            scriptAddress: 178 // ['2']
        }
    },
    percentageToHoldInZerocoin: 0.5,
    xzcZerocoinRatioNotified: -1,
    explorer: {
        test: 'https://testexplorer.zcoin.io/%s/%s',
        main: 'https://explorer.zcoin.io/%s/%s'
    },
    locales: {
        current: '',
        available: {}
    }
}

const mutations = {
    [types.PERSIST_SETTING] () {},

    [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] (state, percentage) {
        state.percentageToHoldInZerocoin = percentage
    },

    [types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED] (state, ratio) {
        state.xzcZerocoinRatioNotified = ratio
    },

    [types.SET_BLOCKCHAIN_EXPLORER_BASE_URL] (state, { network, url }) {
        state.explorer[network] = url
    },

    [types.SET_LOCALE] (state, locale) {
        state.locales.current = locale
    },

    [types.SET_AVAILABLE_LOCALES] (state, locales) {
        state.locales.available = locales
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ commit, state}, initialState) {
        logger.info('got initial settings state %o', initialState)
    },

    /*
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
    */

    [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] ({ commit, state }, value) {
        const percentage = value / 100

        if (state.percentageToHoldInZerocoin === percentage) {
            return
        }

        if (percentage > 1 || percentage < 0) {
            return
        }

        commit(types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN, percentage)
        commit(types.PERSIST_SETTING, {
            key: types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN,
            data: percentage,
            requiresResart: false
        })
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
        logger.debug('suggested mints to fulfill ratio %s', getters.suggestedMintsToFulfillRatio)
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
    },

    [types.SET_BLOCKCHAIN_EXPLORER_BASE_URL] ({ state, commit, rootGetters }, url) {
        const network = rootGetters['Blockchain/networkIdentifier']

        if (state.explorer[network] === url) {
            return
        }

        // todo add some checks if the given string is an absolute url matches the required format (includes 2x %s)

        commit(types.SET_BLOCKCHAIN_EXPLORER_BASE_URL, { network, url })
        getAppSettings().set(allTypes.settings.SET_BLOCKCHAIN_EXPLORER_BASE_URL, url)
    },

    [types.SET_LOCALE] ({ state, commit, getters }, localeKey) {
        if (getters.currentLocaleKey === localeKey) {
            return
        }

        if (!state.locales.available[localeKey]) {
            logger.debug('given locale "%s" does not exist in available locales list: ', localeKey)
            return
        }

        commit(types.SET_LOCALE, localeKey)
        getAppSettings().set(allTypes.settings.SET_LOCALE, localeKey)
    },

    [types.SET_AVAILABLE_LOCALES] ({ state, commit }, locales) {
        commit(types.SET_AVAILABLE_LOCALES, {
            ...state.locales.available,
            ...locales
        })
    }
}

const getters = {
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
            rootGetters['Balance/availableXzc'] > convertToSatoshi(2)
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
    b58Prefixes (state, getters, rootState, rootGetters) {
        const network = rootGetters['Blockchain/networkIdentifier']

        return state.b58Prefixes[network]
    },
    getExplorerBaseUrl (state, getters, rootState, rootGetters) {
        const network = rootGetters['Blockchain/networkIdentifier']

        return state.explorer[network] || ''
    },
    getExplorerAddressUrl (state, getters) {
        return (address) => {
            return format(getters.getExplorerBaseUrl,'address', address)
        }
    },
    getExplorerTransactionUrl (state, getters) {
        return (tx) => {
            return format(getters.getExplorerBaseUrl,'tx', tx)
        }
    },
    availableLocales: (state) => Object.values(state.locales.available),
    currentLocale: (state) => state.locales.current ? state.locales.available[state.locales.current] : undefined,
    currentLocaleKey: (state) => state.locales.current
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
