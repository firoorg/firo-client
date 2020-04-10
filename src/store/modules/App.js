import fs from 'fs'
import path from 'path'
import {platform} from 'os'
import * as types from '../types/App'
import { getAppSettings } from '#/lib/utils'
import { createLogger } from '#/lib/logger'
import {app} from "electron";

const logger = createLogger('zcoin:store:app')

const state = {
    isInitialized: false,
    zcoinLink: '',
    mnemonicSetting: '',
    openAddressBook: null
}

const mutations = {
    [types.MNEMONIC_SETTING] (state, mnemonic) {
        state.mnemonicSetting = mnemonic
    },

    [types.OPEN_ADDRESS_BOOK] (state, open_) {
        state.openAddressBook = open_
    },

    // This is called when app settings are read. It DOES NOT persist information to disk itself. (cf. setIsInitialized)
    SET_IS_INITIALIZED (state, value) {
        this.isInitialized = value;
    },

    // This is called when app settings are read. It DOES NOT persist information itself. (cf. changeBlockchainLocation)
    SET_BLOCKCHAIN_LOCATION (state, location) {
        state.blockchainLocation = location;
    },

    // This triggers a watcher in App.vue.
    gotLink (state, url) {
        state.zcoinLink = url;
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

    // Change the blockchain location to newLocation, creating it if it does not exist, or doing nothing if the empty
    // string (representing the default value) is set. If we fail, we will throw with the reason.
    async changeBlockchainLocation ({commit}, newLocation) {
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

        // This will cause src/main/lib/appSettings.js to call SET_BLOCKCHAIN_LOCATION on startup.
        await getAppSettings().set(`app.SET_BLOCKCHAIN_LOCATION`, newLocation);
        await commit('SET_BLOCKCHAIN_LOCATION', newLocation);
    },

    // Mark down that we have been initialized in settings.
    async setIsInitialized({commit}) {
        // This will cause src/main/lib/appSettings.js to call on startup.
        await getAppSettings().set(`app.SET_IS_INITIALIZED`, true);
        await commit('SET_BLOCKCHAIN_LOCATION', newLocation);
    },

    gotLink ({commit}, url) {
        commit('gotLink', url);
    }
}

const getters = {
    zcoindLocation: () => {
        const rootFolder = process.env.NODE_ENV === 'development' ? process.cwd() : app.getAppPath();
        const unpackedRootFolder = rootFolder.replace('app.asar', 'app.asar.unpacked');
        const zcoindName = platform() === 'win32' ? 'zcoind.exe' : 'zcoind';
        return path.join(unpackedRootFolder, `/assets/core/${platform()}/${zcoindName}`);
    },
    blockchainLocation: (state) => state.blockchainLocation,
    isInitialized: (state) => state.isInitialized,

    mnemonicSetting: (state) => state.mnemonicSetting,
    openAddressBook: (state) => state.openAddressBook,

    zcoinLink: (state) => state.zcoinLink,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
