import * as types from '../types/Settings'

const state = {
    blockchainLocation: '',
    b58Prefixes: {
        mainnet: {
            pubkeyAddress: ['a', 'Z'],
            scriptAddress: ['3', '4']
        },
        testnet: {
            pubkeyAddress: ['T'],
            scriptAddress: ['2']
        }
    }
}

const mutations = {
    [types.SET_BLOCKCHAIN_LOCATION] (state, location) {
        state.blockchainLocation = location
    }
}

const actions = {
    [types.SET_BLOCKCHAIN_LOCATION] ({ commit, state }, { location }) {
        console.log('setting blockchain location', location)
        // todo test if location exists
        commit(types.SET_BLOCKCHAIN_LOCATION, location)
    }
}

const getters = {
    b58Prefixes: (state, getters, rootState) => {
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
