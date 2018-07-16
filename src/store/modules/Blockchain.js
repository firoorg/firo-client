import * as types from '../types/Blockchain'

import Debug from 'debug'
const debug = Debug('zcoin:store:blockchain')

const state = {
    connections: 0,
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
    [types.ON_BLOCK_SUBSCRIPTION] ({ dispatch, state }, block) {
        console.log('ON_BLOCK_SUBSCRIPTION')
        const { connections, currentBlock, status, testnet: isTestnet, type: clientType } = block
        console.log('got block!', block)
        dispatch(types.SET_CONNECTIONS, connections)
        dispatch(types.SET_CURRENT_BLOCK, currentBlock)

        if (status) {
            for (let key of status) {
                console.log(key)
            }
        }

        if (isTestnet) {
            dispatch(types.SET_NETWORK_TO_TESTNET)
        } else {
            dispatch(types.SET_NETWORK_TO_MAINNET)
        }

        dispatch(types.SET_CLIENT_TYPE, clientType)
    },

    [types.SET_CONNECTIONS] ({ commit, state }, connections) {
        if (!connections || isNaN(connections) || connections === state.connections) {
            return
        }

        commit(types.SET_CONNECTIONS, connections)
    },

    [types.SET_CURRENT_BLOCK] ({ commit, state }, { height, timestamp }) {
        if (!height || !timestamp) {
            return
        }

        if (height === state.currentBlock.height) {
            return
        }

        commit(types.SET_CURRENT_BLOCK, { height, timestamp })
    },

    [types.SET_NETWORK_TYPE] ({ commit, state }, type) {
        if (!type) {
            return
        }

        switch (type.toLowerCase()) {
        case 'main':
            commit(types.SET_NETWORK_TO_MAINNET)
            break

        case 'test':
            commit(types.SET_NETWORK_TO_TESTNET)
            break

        default:
            debug('unrecognized network type given')
            break
        }
    },

    [types.SET_CLIENT_TYPE] ({ commit, state }, type) {
        if (!type) {
            return
        }

        switch (type.toLowerCase()) {
        case 'full':
            commit(types.IS_FULL_NODE)
            break

        default:
            debug('unrecognized client type given')
            break
        }
    }
}

const getters = {
    currentBlockHeight: (state) => state.currentBlock.height,
    isTestnet: (state) => state.testnet,
    isMainnet: (state, getters) => !getters.isTestnet,
    networkIdentifier: (state, getters) => getters.isMainnet ? 'mainnet' : 'testnet'
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
