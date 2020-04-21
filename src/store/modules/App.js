import fs from 'fs'
import path from 'path'
import {platform, homedir} from 'os'
import * as types from '../types/App'
import { getAppSettings } from '#/lib/utils'
import { createLogger } from '#/lib/logger'
import {app} from "electron";

const logger = createLogger('zcoin:store:app')

const state = {
    isInitialized: false,
    mnemonicSetting: '',
    openAddressBook: null,
    blockchainLocation: '',
    // This is the value read from our configuration, not what is given to us in APIStatus.
    zcoinClientNetwork: '',
    waitingReason: 'Loading...'
}

const mutations = {
    [types.MNEMONIC_SETTING] (state, mnemonic) {
        state.mnemonicSetting = mnemonic
    },

    [types.OPEN_ADDRESS_BOOK] (state, open_) {
        state.openAddressBook = open_
    },

    // This is called when app settings are read. It DOES NOT persist information to disk itself. (cf. setIsInitialized)
    // We will cause MainLayout.vue to stop showing IntroScreen.
    SET_IS_INITIALIZED (state, value) {
        state.isInitialized = value;
    },

    // This is called when app settings are read. It DOES NOT persist information itself. (cf. changeBlockchainLocation)
    SET_BLOCKCHAIN_LOCATION (state, location) {
        state.blockchainLocation = location;
    },

    // This is called when app settings are read. It DOES NOT persist information itself. (cf. setZcoinClientNetwork)
    SET_ZCOIN_CLIENT_NETWORK (state, network) {
        state.zcoinClientNetwork = network;
    },

    setZcoinClientNetwork(state, network) {
        if (!["test", "mainnet", "regtest"].includes(network)) {
            throw `unknown network type: ${network}`;
        }

        state.zcoinClientNetwork = network;
        getAppSettings().set('app.SET_ZCOIN_CLIENT_NETWORK', network);
    },

    // Change the blockchain location to newLocation, creating it if it does not exist, or doing nothing if the empty
    // string (representing the default value) is set. If we fail, we will throw with the reason.
    changeBlockchainLocation (state, newLocation) {
        if (newLocation !== '') {
            if (!path.isAbsolute(newLocation)) {
                throw "Location for the new blockchain must be an absolute path.";
            }

            if (!fs.existsSync(newLocation)) {
                // Throws on failure.
                fs.mkdirSync(newLocation);
            }

            try {
                fs.accessSync(newLocation, fs.constants.W_OK | fs.constants.R_OK);
            } catch {
                throw `${newLocation} is not writable by the current user.`
            }
        }

        state.blockchainLocation = newLocation
        getAppSettings().set(`app.SET_BLOCKCHAIN_LOCATION`, newLocation);
    },

    // Mark down that we have been initialized in settings. This will cause MainLayout.vue to stop showing IntroScreen.
    setIsInitialized(state, isInitialized) {
        if (!state.blockchainLocation) {
            throw "Trying to mark us as initialized when App.blockchainLocation has not been set.";
        }

        if (!state.zcoinClientNetwork) {
            throw "Trying to mark us as initialized when App.zcoinClientNetwork has not been set."
        }

        state.isInitialized = isInitialized;
        getAppSettings().set(`app.SET_IS_INITIALIZED`, isInitialized);
    },

    // This determines whether WaitingScreen will be shown from MainLayout.
    setWaitingReason(state, value) {
        state.waitingReason = value;
    }
}

const actions = {
    async [types.MNEMONIC_SETTING] ({ commit, state }, mnemonic) {
        commit(types.MNEMONIC_SETTING, mnemonic);
    },

    async [types.OPEN_ADDRESS_BOOK] ({ commit, state }, open_) {
        commit(types.OPEN_ADDRESS_BOOK, open_);
    },

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
    defaultZcoinRootDirectory: () => {
        switch (platform()) {
        // This is the ID for *all* Windows versions
        case "win32":
            return path.join(homedir(), "AppData", "Roaming", "Zcoin");

        case "darwin":
            return path.join(homedir(), "Library", "Application Support", "zcoin");

        case "linux":
            return path.join(homedir(), ".zcoin");

        default:
            throw "unkown platform";
        }
    },
    zcoindLocation: () => {
        const rootFolder = process.env.NODE_ENV === 'development' ? process.cwd() : app.getAppPath();
        const unpackedRootFolder = rootFolder.replace('app.asar', 'app.asar.unpacked');
        const zcoindName = platform() === 'win32' ? 'zcoind.exe' : 'zcoind';
        return path.join(unpackedRootFolder, `/assets/core/${platform()}/${zcoindName}`);
    },
    // It is invalid to access us prior to the app being initialized.
    walletLocation: (state, getters) => {
        let dataDir;
        switch (getters.zcoinClientNetwork) {
        case "mainnet":
            dataDir = getters.defaultZcoinRootDirectory;
            break;

        case "regtest":
            dataDir = path.join(getters.defaultZcoinRootDirectory, "regtest");
            break;

        case "test":
            dataDir = path.join(getters.defaultZcoinRootDirectory, "testnet3");
            break;

        default:
            throw `unknown network: ${getters.zcoinClientNetwork}`;
        }

        return path.join(dataDir, "wallet.dat");
    },
    zcoinClientNetwork: (state) => state.zcoinClientNetwork,
    blockchainLocation: (state) => state.blockchainLocation,
    isInitialized: (state) => state.isInitialized,

    // If waitingReason is not undefined, WaitingScreen (shown by MainLayout) will display that reason to the user as an
    // overlay.
    waitingReason: (state) => state.waitingReason || undefined,
    mnemonicSetting: (state) => state.mnemonicSetting,
    openAddressBook: (state) => state.openAddressBook
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
