import fs from 'fs'
import * as types from '../types/App'
import { getApp, getAppSettings } from '#/lib/utils'
import { createLogger } from '#/lib/logger'
import Vue from 'vue'

const logger = createLogger('zcoin:store:app')

const state = {
    isReady: false,
    isRunning: false,
    isStopping: false,
    isRestarting: false,
    walletIsLocked: false,
    walletVersion: 0,
    showIntroScreen: true,
    passphrase: null,
    appVersion: null,
    blockchainLocation: ''
}

const mutations = {
    [types.IS_READY] (state) {
        state.isReady = true
        state.isRestarting = false
        state.isStopping = false
    },

    [types.SET_BLOCKCHAIN_LOCATION] (state, location) {
        state.blockchainLocation = location
    },

    [types.SET_APP_VERSION] (state, version) {
        state.appVersion = version
    },

    // daemon

    [types.DAEMON_IS_RUNNING] (state) {
        state.isRunning = true
    },

    [types.DAEMON_STOPPED] (state) {
        state.isReady = false
        state.isRunning = false
        state.isStopping = false
    },

    [types.DAEMON_STOP] (state) {
        state.isReady = false
        state.isStopping = true
    },

    [types.DAEMON_RESTART] (state) {
        state.isRestarting = true
    },

    [types.DAEMON_START] (state) {
        state.isRestarting = true
    },

    // wallet lock

    [types.SET_WALLET_LOCKED] (state, isLocked) {
        Vue.set(state, 'walletIsLocked', isLocked)
    },

    [types.SET_WALLET_VERSION] (state, version) {
        state.walletVersion = version
    },

    [types.LOCK_WALLET] () {
    },

    // intro

    [types.HIDE_INTRO_SCREEN] (state) {
        state.showIntroScreen = false
    },

    // passphrase

    [types.SET_CURRENT_PASSPHRASE] (state, passphrase) {
        state.passphrase = passphrase
    },

    [types.CLEAR_PASSPHRASE] (state) {
        state.passphrase = null
    }
}

const actions = {
    [types.IS_READY] ({ commit, state }) {
        if (state.isReady) {
            return
        }

        commit(types.IS_READY)
    },

    [types.SET_WALLET_LOCKED] ({ commit, state }, isLocked) {
        if (state.walletIsLocked === isLocked) {
            return
        }

        commit(types.SET_WALLET_LOCKED, isLocked)
    },

    [types.SET_WALLET_VERSION] ({ commit, state }, version) {
        if (state.walletVersion === version) {
            return
        }

        commit(types.SET_WALLET_VERSION, version)
    },

    [types.LOCK_WALLET] ({ commit, state }, passphrase) {
        // already locked. returning
        if (state.walletIsLocked) {
            logger.info('wallet is already locked')
            return
        }

        commit(types.LOCK_WALLET, { passphrase })
    },

    [types.DAEMON_IS_RUNNING] ({ commit }) {
        commit(types.DAEMON_IS_RUNNING)
    },

    [types.DAEMON_STOP] ({ commit, state }) {
        if (state.isStopping || !state.isRunning) {
            return
        }

        commit(types.DAEMON_STOP)
    },

    [types.DAEMON_STOPPED] ({ commit, state }) {
        if (!state.isRunning) {
            return
        }

        commit(types.DAEMON_STOPPED)
    },

    [types.DAEMON_RESTART] ({ commit, state }) {
        if (state.isRestarting) {
            return
        }

        // set restart flag
        commit(types.DAEMON_RESTART)

        if (!state.isRunning) {
            return commit(types.DAEMON_START)
        }

        // stop daemon
        commit(types.DAEMON_STOP)
    },

    [types.DAEMON_START] ({ state, commit }) {
        if (state.isRunning) {
            return
        }

        commit(types.DAEMON_START)
    },

    [types.HIDE_INTRO_SCREEN] ({ commit, state }) {
        commit(types.HIDE_INTRO_SCREEN)
    },

    [types.SET_CURRENT_PASSPHRASE] ({ commit, state }, passphrase) {
        if (state.passphrase === passphrase) {
            return
        }

        commit(types.SET_CURRENT_PASSPHRASE, passphrase)
    },

    [types.CLEAR_PASSPHRASE] ({ commit }) {
        commit(types.CLEAR_PASSPHRASE)
    },

    [types.SET_BLOCKCHAIN_LOCATION] ({ commit, state }, location) {
        if (!location) {
            return
        }

        if (!fs.existsSync(location)) {
            logger.warn('given location does not exist: %s', location)
            return
        }

        // todo: could potentially watch the location to catch cases where the user freakes out and...
        // todo: ...moves the folder while zcoin is running

        commit(types.SET_BLOCKCHAIN_LOCATION, location)
        getAppSettings().set(`app.${types.SET_BLOCKCHAIN_LOCATION}`, location)
    },

    [types.SET_APP_VERSION] ({ commit }, version) {
        if (state.appVersion === version) {
            return
        }

        commit(types.SET_APP_VERSION, version)
    },

    [types.PERSIST_APP_VERSION] ({ dispatch, getters }) {
        const version = getApp().getVersion()

        if (getters.appVersion === version) {
            return
        }

        dispatch(types.SET_APP_VERSION, version)
        getAppSettings().set(`app.${types.SET_APP_VERSION}`, version)
    }
}

const getters = {
    isReady: (state) => state.isReady || false,
    isStopping: (state) => state.isStopping || false,
    isRunning: (state) => state.isRunning || false,
    isRestarting: (state) => state.isRestarting || false,
    appVersion: (state) => state.appVersion,
    isInitialRun: (state) => {
        return !state.appVersion
    },

    blockchainLocation: (state) => {

        return state.blockchainLocation
    },
    hasBlockchainLocation: (state, getters) => !!getters.blockchainLocation,

    showIntroScreen: (state, getters) => state.showIntroScreen,
    isLocked: (state) => state.walletIsLocked,
    walletVersion: (state) => state.walletVersion,
    addressBelongsToWallet: (state, getters, rootState, rootGetters) => {
        return (address) => {
            const isPaymentRequestAddress = !!rootGetters['PaymentRequest/paymentRequests'].find((el) => {
                if (typeof el.address === 'string') {
                    return el.address === address
                }

                return el.address && el.address.address === address
            })

            if (isPaymentRequestAddress) {
                return true
            }

            const isWalledAddress = rootGetters['Address/walletAddresses'].find((addr) => {
                return addr.address === address
            })

            return !!isWalledAddress
        }
    },
    showIncomingPaymentRequest (state, getters, rootState, rootGetters) {
        return rootGetters['Clipboard/hasIncomingPaymentRequest'] &&
            !rootGetters['Clipboard/isNotified']
    },
    hasOpenOverlay (state, getters, rootState, rootGetters) {
        const windowHasOpenModal = rootGetters['Window/hasOpenModal']
        const networkIsConnected = rootGetters['Network/isConnected']
        const networkConnectionError = rootGetters['Network/ConnectionError']

        return windowHasOpenModal ||
            !networkIsConnected ||
            getters.showIntroScreen ||
            networkConnectionError ||
            getters.showIncomingPaymentRequest
    },
    currentPassphrase: (state) => state.passphrase
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
