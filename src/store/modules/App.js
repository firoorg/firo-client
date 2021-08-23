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
    allowBreakingMasternodes: false,
    temporaryFirodArguments: [],
    colorTheme: 'system',
    // This is used to make ReceivePage load quicker.
    cachedAddress: ""
}

const mutations = {
    setFiroClientNetwork(state, network) {
        if (!["test", "mainnet", "regtest"].includes(network)) {
            throw `unknown network type: ${network}`;
        }

        state.firoClientNetwork = network;
    },

    // Mark down the blockchain location in settings.
    setBlockchainLocation(state, newLocation) {
        state.blockchainLocation = newLocation
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
    },

    setTemporaryFirodArguments(state, args) {
        state.temporaryFirodArguments = args || [];
    },

    // This determines whether WaitingScreen will be shown from MainLayout.
    setWaitingReason(state, value) {
        state.waitingReason = value;
    },

    setFirodHasStarted(state, value) {
        state.firodHasStarted = value;
    },

    setCachedMnemonic(state, value) {
        state.cachedMnemonic = value;
    },

    setAllowBreakingMasternodes(state, value) {
        state.allowBreakingMasternodes = value;
    },

    setColorTheme(state, value) {
        if (!['system', 'dark', 'light'].includes(value)) {
            throw "unknown color theme value";
        }
        state.colorTheme = value;
    },

    setCachedAddress(state, value) {
        state.cachedAddress = value;
    }
}

const actions = {
    async setIsInitialized({commit}, value) {
        await getAppSettings().set('isInitialized', value);
        commit('setIsInitialized', value);
    },

    async setFiroClientNetwork({commit}, value) {
        await getAppSettings().set('network', value);
        commit('setFiroClientNetwork', value);
    },

    async setBlockchainLocation({commit}, value) {
        await getAppSettings().set('blockchainLocation', value);
        commit('setBlockchainLocation', value);
    },

    async setTemporaryFirodArguments({commit}, value) {
        await getAppSettings().set('temporaryFirodArguments', value);
        commit('setTemporaryFirodArguments', value);
    },

    async setColorTheme({commit}, value) {
        if (!['system', 'dark', 'light'].includes(value)) {
            throw "unknown color theme value";
        }
        await getAppSettings().set('colorTheme', value);
        commit('setColorTheme', value);
    }
}

const getters = {
    temporaryFirodArguments: (state) => state.temporaryFirodArguments,
    allowBreakingMasternodes: (state) => state.allowBreakingMasternodes,
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
        if (process.env.NODE_ENV === "development" || process.env.FIRO_CLIENT_TEST) {
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
    showPaymentPendingWarning: (state, getters, rootState, rootGetters) =>
        rootGetters['Blockchain/isBlockchainSynced'] && rootGetters['Balance/availablePublic'] > 0.01e8,
    // If waitingReason is not undefined, WaitingScreen (shown by MainLayout) will display that reason to the user as an
    // overlay.
    waitingReason: (state) => state.waitingReason,
    cachedMnemonic: (state) => state.cachedMnemonic,
    colorTheme: (state) => state.colorTheme || 'system',
    cachedAddress: (state) => state.cachedAddress
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
