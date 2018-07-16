import * as types from '../types/Blockchain'

const state = {
    connections: 1,
    currentBlock: {
        height: 0,
        timestamp: 0
    },
    status: {
        IsBlockchainSynced: false,
        IsFailed: false,
        IsSynced: false,
        IsWinnersListSynced: false,
        IsZnodeListSynced: false
    },
    testnet: true,
    type: 'full'
}

const mutations = {
    [types.SET_CONNECTIONS] (state, connections) {
        state.connections = connections
    },

    [types.SET_CURRENT_BLOCK] (state, { height, timestamp }) {
        state.currentBlock = {
            height,
            timestamp
        }
    },

    [types.IS_BLOCKCHAIN_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            IsBlockchainSynced: isSynced
        }
    },

    [types.IS_FAILED] (state, isFailed) {
        state.status = {
            ...state.status,
            IsFailed: isFailed
        }
    },

    [types.IS_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            IsSynced: isSynced
        }
    },

    [types.IS_WINNERS_LIST_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            IsWinnersListSynced: isSynced
        }
    },

    [types.IS_ZNODE_LIST_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            IsZnodeListSynced: isSynced
        }
    },

    [types.SET_NETWORK_TO_MAINNET] (state) {
        state.testnet = false
    },

    [types.SET_NETWORK_TO_TESTNET] (state) {
        state.testnet = true
    },

    [types.IS_FULL_NODE] (state) {
        // todo get string from config
        state.type = 'full'
    }
}

const actions = {
    [types.ON_BLOCK_SUBSCRIPTION] ({ commit, state }, block) {
        console.log('got block!', block)
    }
}

const getters = {

}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
