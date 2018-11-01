import * as types from '../types/Blockchain'

import Debug from 'debug'
const debug = Debug('zcoin:store:blockchain')

const state = {
    connections: 0,
    blockchainTip: 0,
    currentBlock: {
        height: 0,
        timestamp: 0
    },
    status: {
        isBlockchainSynced: false,
        isFailed: false,
        isSynced: false,
        isWinnersListSynced: false,
        isZnodeListSynced: false
    },
    testnet: true,
    type: 'full',
    averageBlockTime: 0
}

export const mutations = {
    [types.SET_CONNECTIONS] (state, connections) {
        state.connections = connections
    },

    /*
    [types.SET_BLOCKCHAIN_TIP] (state, height) {
        state.blockchainTip = height
    },
    */

    [types.SET_CURRENT_BLOCK] (state, { height, timestamp }) {
        state.currentBlock = {
            height,
            timestamp
        }
    },

    [types.IS_BLOCKCHAIN_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            isBlockchainSynced: isSynced
        }
    },

    [types.IS_FAILED] (state, isFailed) {
        state.status = {
            ...state.status,
            isFailed: isFailed
        }
    },

    [types.IS_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            isSynced: isSynced
        }
    },

    [types.IS_WINNERS_LIST_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            isWinnersListSynced: isSynced
        }
    },

    [types.IS_ZNODE_LIST_SYNCED] (state, isSynced) {
        state.status = {
            ...state.status,
            isZnodeListSynced: isSynced
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
    },

    [types.SET_AVERAGE_BLOCK_TIME] (state, averageBlockTime) {
        state.averageBlockTime = averageBlockTime
    }
}

export const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch, commit, state }, initialState) {
        const { connections, currentBlock, status, testnet: isTestnet, type: clientType, avgBlockTime } = initialState
        const { height, timestamp } = currentBlock

        dispatch(types.SET_CONNECTIONS, connections)

        dispatch(types.SET_CURRENT_BLOCK, {
            height,
            timestamp
        })

        if (isTestnet) {
            dispatch(types.SET_NETWORK_TO_TESTNET)
        } else {
            dispatch(types.SET_NETWORK_TO_MAINNET)
        }

        dispatch(types.SET_CLIENT_TYPE, clientType)

        dispatch(types.SET_AVERAGE_BLOCK_TIME, {
            averageBlockTime: avgBlockTime
        })

        if (!status) {
            return
        }

        for (let [key, value] of Object.entries(status)) {
            if (state.status[key] === undefined) {
                debug('unknown blockchain status key', key, value)
                continue
            }

            if (state.status[key] === value) {
                continue
            }

            const mutationName = key.replace(/\.?([A-Z]+)/g, function (x, y) {
                return '_' + y
            }).replace(/^_/, '').toUpperCase()

            if (!types[mutationName]) {
                debug('no mutation name found for', mutationName)
            }

            console.log('committing mutation', mutationName)

            commit(types[mutationName], value)
        }
    },

    [types.ON_BLOCK_SUBSCRIPTION] ({ dispatch }, block) {
        dispatch(types.SET_INITIAL_STATE, block)
    },

    [types.SET_BLOCKCHAIN_TIP] ({ commit, state }, height) {
        if (!height) {
            return
        }

        if (state.blockchainTip >= height) {
            return
        }

        commit(types.SET_BLOCKCHAIN_TIP, height)
    },

    [types.SET_CONNECTIONS] ({ commit, state }, connections) {
        if (connections === undefined || isNaN(connections) || connections === state.connections) {
            return
        }

        commit(types.SET_CONNECTIONS, connections)
    },

    [types.SET_CURRENT_BLOCK] ({ dispatch, commit, state }, { height, timestamp }) {
        if (!height || !timestamp) {
            return
        }

        if (height === state.currentBlock.height) {
            return
        }

        // dispatch(types.SET_BLOCKCHAIN_TIP, height)
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

    [types.SET_NETWORK_TO_TESTNET] ({ commit, getters }) {
        if (getters.isTestnet) {
            return
        }

        commit(types.SET_NETWORK_TO_TESTNET)
    },

    [types.SET_NETWORK_TO_MAINNET] ({ commit, getters }) {
        if (getters.isMainnet) {
            return
        }

        commit(types.SET_NETWORK_TO_MAINNET)
    },

    [types.SET_CLIENT_TYPE] ({ commit, state }, type) {
        if (!type) {
            return
        }

        if (type === state.type) {
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
    },

    [types.SET_AVERAGE_BLOCK_TIME] ({ commit, state }, { averageBlockTime }) {
        const averageBlockTimeInMs = averageBlockTime * 1000

        if (state.averageBlockTime === averageBlockTimeInMs) {
            return
        }

        commit(types.SET_AVERAGE_BLOCK_TIME, averageBlockTimeInMs)
    }
}

export const getters = {
    currentBlockHeight: (state) => state.currentBlock.height,
    currentBlockTimestamp: (state) => state.currentBlock.timestamp,
    // tipHeight: (state) => state.blockchainTip,
    isTestnet: (state) => state.testnet,
    isMainnet: (state, getters) => !getters.isTestnet,
    status: (state) => state.status || {},
    isSynced: (state, getters) => getters.status.isSynced,
    isBlockchainSynced: (state, getters) => getters.status.isBlockchainSynced,
    isZnodeListSynced: (state, getters) => getters.status.isZnodeListSynced,
    networkIdentifier: (state, getters) => getters.isMainnet ? 'mainnet' : 'testnet',
    averageBlockTimeInMilliSeconds: (state) => state.averageBlockTime,
    connections: (state) => state.connections,
    hasConnections: (state) => !!state.connections
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
