import fs from 'fs'
import * as types from '../types/Settings'

import Debug from 'debug'
const debug = Debug('zcoin:store:settings')

const state = {
    blockchainLocation: '',
    b58Prefixes: {
        mainnet: {
            pubkeyAddress: 82, // ['a', 'Z'],
            scriptAddress: 7 // ['3', '4']
        },
        testnet: {
            pubkeyAddress: 65, // ['T'],
            scriptAddress: 178 // ['2']
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
    }
}

const getters = {
    blockchainLocation: (state) => state.blockchainLocation,
    hasBlockchainLocation: (state, getters) => !!getters.blockchainLocation,
    b58Prefixes: (state, getters, rootState, rootGetters) => {
        // networkIdentifier
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
