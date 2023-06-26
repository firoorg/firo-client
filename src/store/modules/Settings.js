import { format } from 'util'


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
        regtest: 'https://regtestexplorer.invalid/%s/%s',
        'regtest-ql': 'https://regtestexplorer.invalid/%s/%s'
    },
    showWarning: true,
    daemonSettings: {}
}

const mutations = {
    UPDATE_SETTING() {},

    MNEMONIC_WARNING_SETTING(state, showW) {
        state.showWarning = showW
    },

    setDaemonSettings (state, settings) {
        state.daemonSettings = settings;
    }
}

const actions = {
    SET_INITIAL_STATE({ state, commit, getters }, initialState) {
        if (!initialState) return;

        commit.setDaemonSettings({ state, commit, getters }, {
            settings: initialState,
            isUpdate: false
        })
    },

    ON_SETTINGS_SUBSCRIPTION({ state, commit, getters }, data) {
        if (!data) return;

        commit.setDaemonSettings({ state, commit, getters }, {
            settings: data,
            isUpdate: true
        })
    },

    MNEMONIC_WARNING_SETTING({ state, commit }, showW) {
        commit('MNEMONIC_WARNING_SETTING', showW);
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
