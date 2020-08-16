import { format } from 'util'

import * as types from '../types/Settings'
import { getApp, getAppSettings } from 'lib/utils'

import { convertToSatoshi, getDenominationsToMintSubtractingFee } from 'lib/convert'
import { createLogger } from 'lib/logger'

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
        },
        regtest: {
            pubkeyAddress: 65, // ['T'],
            scriptAddress: 178 // ['2']
        }
    },
    percentageToHoldInZerocoin: 1.0,
    xzcZerocoinRatioNotified: -1,
    explorer: {
        test: 'https://testexplorer.zcoin.io/%s/%s',
        main: 'https://explorer.zcoin.io/%s/%s',
        // This isn't an actual site (obviously), but it'll only show up in testing and it should be fairly obvious
        // what's happening, so meh.
        regtest: 'https://regtestexplorer.invalid/%s/%s'
    },
    locales: {
        current: '',
        available: {}
    },
    daemonSettingNames: [
        'torsetup'
    ],
    daemonSettings: {
    },

    showWarning: true
}

const mutations = {
    [types.UPDATE_SETTING] () {},

    [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] (state, percentage) {
        state.percentageToHoldInZerocoin = percentage
    },

    [types.MNEMONIC_WARNING_SETTING] (state, showW) {
        state.showWarning = showW
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
    },

    setDaemonSettings (state, settings) {
        state.daemonSettings = settings;
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ state, commit, getters }, initialState) {
        logger.info('got initial settings state %o', initialState)

        if (!initialState) {
            return
        }

        setDaemonSettings({ state, commit, getters }, {
            settings: initialState,
            isUpdate: false
        })
    },

    [types.ON_SETTINGS_SUBSCRIPTION] ({ state, commit, getters }, data) {
        if (!data) {
            return
        }


        setDaemonSettings({ state, commit, getters }, {
            settings: data,
            isUpdate: true
        })
    },

    async [types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN] ({ commit, state }, value) {
        const percentage = value / 100

        if (state.percentageToHoldInZerocoin === percentage) {
            return
        }

        if (percentage > 1 || percentage < 0) {
            return
        }

        commit(types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN, percentage)
        await getAppSettings().set(`settings.${types.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN}`, percentage * 100)
        commit(types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED, -1)
    },

    [types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED] ({ commit, state, rootGetters }) {
        const ratio = rootGetters['Balance/xzcZerocoinRatio']

        if (state.xzcZerocoinRatioNotified === ratio) {
            return
        }

        commit(types.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED, ratio)
    },

    async [types.SET_BLOCKCHAIN_EXPLORER_BASE_URL] ({ state, commit, rootGetters }, urlOrUrlNetworkPair) {
        let url = undefined
        let network = undefined

        // change source is settings input
        if (typeof urlOrUrlNetworkPair === 'string') {
            network = rootGetters['ApiStatus/network']
            url = urlOrUrlNetworkPair
        }
        // change source is persistent settings object
        else {
            network = urlOrUrlNetworkPair.network
            url = urlOrUrlNetworkPair.url
        }

        if (!state.explorer[network] || state.explorer[network] === url) {
            return
        }

        // todo add some checks if the given string is an absolute url matches the required format (includes 2x %s)

        commit(types.SET_BLOCKCHAIN_EXPLORER_BASE_URL, { network, url })
        await getAppSettings().set(`settings.${types.SET_BLOCKCHAIN_EXPLORER_BASE_URL}`, { network, url })
    },

    async [types.SET_LOCALE] ({ state, commit, getters }, localeKey) {
        if (getters.currentLocaleKey === localeKey) {
            logger.debug('given locale "%s" is already set.')
            return
        }

        if (!state.locales.available[localeKey]) {
            logger.debug('given locale "%s" does not exist in available locales list: ', localeKey)
            return
        }

        commit(types.SET_LOCALE, localeKey)
        await getAppSettings().set(`settings.${types.SET_LOCALE}`, localeKey)
    },

    [types.SET_AVAILABLE_LOCALES] ({ state, commit }, locales) {
        commit(types.SET_AVAILABLE_LOCALES, {
            ...state.locales.available,
            ...locales
        })
    },

    [types.MNEMONIC_WARNING_SETTING] ({ state, commit }, showW) {
        commit(types.MNEMONIC_WARNING_SETTING, showW);
    },
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
            rootGetters['Balance/xzcZerocoinRatio'] !== state.xzcZerocoinRatioNotified &&
            rootGetters['Blockchain/isBlockchainSynced']
    },
    showWarning: (state) => state.showWarning,
    suggestedMintAmount (state, getters, rootState, rootGetters) {
        const alreadyHolding = rootGetters['Balance/unconfirmedZerocoin'] + rootGetters['Balance/availableZerocoin'];
        const shouldHold = (alreadyHolding + rootGetters['Balance/availableXzc']) * state.percentageToHoldInZerocoin;
        return Math.max(shouldHold - alreadyHolding, 0);
    },
    suggestedMints (state, getters) {
        return getDenominationsToMintSubtractingFee(getters.suggestedMintAmount)
    },
    b58Prefixes (state, getters, rootState, rootGetters) {
        const network = rootGetters['ApiStatus/network']

        return state.b58Prefixes[network]
    },
    getExplorerBaseUrl (state, getters, rootState, rootGetters) {
        const network = rootGetters['ApiStatus/network']

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
    currentLocale: (state, getters) => getters.currentLocaleKey ? state.locales.available[getters.currentLocaleKey] : undefined,
    currentLocaleKey: (state) => {
        const fallbackLocale = (getApp().getLocale()).substr(0, 2)

        return process.env.LOCALE || state.locales.current || fallbackLocale
    },

    daemonSettings: (state) => state.daemonSettings,
    isConnectedViaTor: (state, getters) =>  (getters.daemonSettings['-torsetup'] || {}).data === '1'
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
