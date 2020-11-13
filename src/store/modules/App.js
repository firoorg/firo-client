import fs from 'fs'
import path from 'path'
import {homedir} from 'os'
import * as types from '../types/App'
import { getAppSettings, getApp } from 'lib/utils'
import { createLogger } from 'lib/logger'

const logger = createLogger('firo:store:app')

const state = {
    isInitialized: false,
    // This is used so that we will always have the same mnemonic even if we go back and forth through several different
    // screens. Cached mnemonic is of the type {mnemonic: string, mnemonicPassphrase: string | null, isNewMnemonic: boolean}
    cachedMnemonic: null,
    blockchainLocation: null,
    // This is the value read from our configuration, not what is given to us in APIStatus.
    firoClientNetwork: null,
    waitingReason: 'Loading...',
    firodHasStarted: false,
    // This is used to go back to the page we were looking at when an automatic reload occurs.
    currentRoute: null
}

const mutations = {
    // This is called when app settings are read. It DOES NOT persist information to disk itself. (cf. setIsInitialized)
    // We will cause MainLayout.vue to stop showing IntroScreen.
    SET_IS_INITIALIZED (state, value) {
        state.isInitialized = value;
    },

    // This is called when app settings are read. It DOES NOT persist information itself. (cf. changeBlockchainLocation)
    SET_BLOCKCHAIN_LOCATION (state, location) {
        state.blockchainLocation = location;
    },

    // This is called when app settings are read. It DOES NOT persist information itself. (cf. setFiroClientNetwork)
    SET_ZCOIN_CLIENT_NETWORK (state, network) {
        state.firoClientNetwork = network;
    },

    setFiroClientNetwork(state, network) {
        if (!["test", "mainnet", "regtest"].includes(network)) {
            throw `unknown network type: ${network}`;
        }

        state.firoClientNetwork = network;
        getAppSettings().set('app.SET_ZCOIN_CLIENT_NETWORK', network);
    },

    // Mark down the blockchain location in settings.
    setBlockchainLocation(state, newLocation) {
        state.blockchainLocation = newLocation
        getAppSettings().set(`app.SET_BLOCKCHAIN_LOCATION`, newLocation);
    },

    // Mark down that we have been initialized in settings. This will cause MainLayout.vue to stop showing IntroScreen.
    setIsInitialized(state, isInitialized) {
        if (isInitialized) {
            if (!state.blockchainLocation) {
                throw "Trying to mark us as initialized when App.blockchainLocation has not been set.";
            }

            if (!state.firoClientNetwork) {
                throw "Trying to mark us as initialized when App.firoClientNetwork has not been set."
            }
        }

        state.isInitialized = isInitialized;
        getAppSettings().set(`app.SET_IS_INITIALIZED`, isInitialized);
    },

    // This determines whether WaitingScreen will be shown from MainLayout.
    setWaitingReason(state, value) {
        state.waitingReason = value;
    },

    setFirodHasStarted(state, value) {
        state.firodHasStarted = value;
    },

    // Set from a router.afterEach hook in main.js. We'll be used to figure out where we left off if we're reloading the
    // app. This MUST NOT be called directly.
    setCurrentRoute(state, value) {
        state.currentRoute = value;
    },

    setCachedMnemonic(state, value) {
        state.cachedMnemonic = value;
    }
}

const actions = {
    async SET_IS_INITIALIZED({commit}, value) {
        commit('SET_IS_INITIALIZED', value);
    },

    // This is called when app settings are read. It DOES NOT set the blockchain location itself.
    async SET_BLOCKCHAIN_LOCATION ({commit}, location) {
        commit('SET_BLOCKCHAIN_LOCATION', location);
    },

    // This is called when app settings are read. It DOES NOT set the blockchain location itself.
    async SET_ZCOIN_CLIENT_NETWORK ({commit}, network) {
        commit('SET_ZCOIN_CLIENT_NETWORK', network);
    }
}

const getters = {
    defaultFiroRootDirectory: () => {
        switch (process.platform) {
        // This is the ID for *all* Windows versions
        case "win32":
            return path.join(homedir(), "AppData", "Roaming", "Firo");

        case "darwin":
            return path.join(homedir(), "Library", "Application Support", "firo");

        case "linux":
            return path.join(homedir(), ".firo");

        default:
            throw "unknown platform";
        }
    },
    firodLocation: () => {
        const firodName = process.platform === 'win32' ? 'firod.exe' : 'firod';

        let appDirectory;
        if (process.env.NODE_ENV === "development" || process.env.ZCOIN_CLIENT_TEST) {
            appDirectory = process.cwd();
        } else {
            appDirectory = getApp().getAppPath().replace('app.asar', 'app.asar.unpacked');
        }

        return path.resolve(appDirectory, 'assets', 'core', process.platform, firodName);
    },
    // It is invalid to access us prior to the app being initialized.
    //
    // Note: This code is duplicated in IntroScreenBlockchainLocation.
    walletLocation: (state, getters) => {
        if (!getters.blockchainLocation) {
            return "blockchainLocation not yet set";
        }

        let dataDir;
        switch (getters.firoClientNetwork) {
        case "mainnet":
            dataDir = getters.blockchainLocation;
            break;

        case "regtest":
            dataDir = path.join(getters.blockchainLocation, "regtest");
            break;

        case "test":
            dataDir = path.join(getters.blockchainLocation, "testnet3");
            break;

        default:
            throw `unknown network: ${getters.firoClientNetwork}`;
        }

        return path.join(dataDir, "wallet.dat");
    },
    firoClientNetwork: (state) => state.firoClientNetwork,
    blockchainLocation: (state) => state.blockchainLocation,
    isInitialized: (state) => state.isInitialized,
    firodHasStarted: (state) => state.firodHasStarted,
    currentRoute: (state) => state.currentRoute,
    showPaymentPendingWarning: (state, getters, rootState, rootGetters) => rootGetters['Balance/availablePublic'] > 1e8,
    // If waitingReason is not undefined, WaitingScreen (shown by MainLayout) will display that reason to the user as an
    // overlay.
    waitingReason: (state) => state.waitingReason,
    cachedMnemonic: (state) => state.cachedMnemonic,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
