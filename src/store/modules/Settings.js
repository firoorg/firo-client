import { format } from 'util'
import * as types from '../types/Settings'
import { createLogger } from 'lib/logger'

const logger = createLogger('firo:store:settings')

const state = {
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
    explorer: {
        test: 'https://testexplorer.firo.io/%s/%s',
        main: 'https://explorer.firo.io/%s/%s',
        // This isn't an actual site (obviously), but it'll only show up in testing and it should be fairly obvious
        // what's happening, so meh.
        regtest: 'https://regtestexplorer.invalid/%s/%s'
    },
    showWarning: true,
    daemonSettings: {}
}

const mutations = {
    [types.UPDATE_SETTING] () {},

    [types.MNEMONIC_WARNING_SETTING] (state, showW) {
        state.showWarning = showW
    },

    setDaemonSettings (state, settings) {
        state.daemonSettings = settings;
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ state, commit, getters }, initialState) {
        logger.info('got initial settings state %o', initialState)

        if (!initialState) return;

        commit.setDaemonSettings({ state, commit, getters }, {
            settings: initialState,
            isUpdate: false
        })
    },

    [types.ON_SETTINGS_SUBSCRIPTION] ({ state, commit, getters }, data) {
        if (!data) return;

        commit.setDaemonSettings({ state, commit, getters }, {
            settings: data,
            isUpdate: true
        })
    },

    [types.MNEMONIC_WARNING_SETTING] ({ state, commit }, showW) {
        commit(types.MNEMONIC_WARNING_SETTING, showW);
    },
}

const getters = {
    showWarning: (state) => state.showWarning,
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
