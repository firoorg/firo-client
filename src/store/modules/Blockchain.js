import * as types from '../types/Blockchain'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store:blockchain')

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
    type: 'full',
    averageBlockTime: 0,
    syncBlocksPerSecond: {
        startBlockHeight: 0,
        startTimestamp: 0,
        currentTimestamp: 0
    }
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

    [types.IS_FULL_NODE] (state) {
        // todo get string from config
        state.type = 'full'
    },

    [types.SET_AVERAGE_BLOCK_TIME] (state, averageBlockTime) {
        state.averageBlockTime = averageBlockTime
    },

    [types.UPDATE_SYNC_BLOCKS_PER_SECOND] (state, { height, timestamp }) {
        if (!state.syncBlocksPerSecond.startBlockHeight) {
            state.syncBlocksPerSecond.startBlockHeight = height
            state.syncBlocksPerSecond.startTimestamp = timestamp
        }

        state.syncBlocksPerSecond.currentTimestamp = timestamp
    }
}

export const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch, commit, state }, initialState) {
        logger.info('received blockchain initial state %o', initialState)
        const { connections, currentBlock, status, type: clientType, avgBlockTime } = initialState
        const { height, timestamp } = currentBlock

        dispatch(types.SET_CONNECTIONS, connections)

        dispatch(types.SET_CURRENT_BLOCK, {
            height,
            timestamp
        })

        commit(types.UPDATE_SYNC_BLOCKS_PER_SECOND, {
            height,
            timestamp: Date.now()
        })

        dispatch(types.SET_CLIENT_TYPE, clientType)

        dispatch(types.SET_AVERAGE_BLOCK_TIME, {
            averageBlockTime: avgBlockTime
        })

        if (!status) {
            return
        }

        for (let [key, value] of Object.entries(status)) {
            if (state.status[key] === undefined) {
                logger.warn('unknown blockchain status key: %s, %o', key, value)
                continue
            }

            if (state.status[key] === value) {
                continue
            }

            const mutationName = key.replace(/\.?([A-Z]+)/g, function (x, y) {
                return '_' + y
            }).replace(/^_/, '').toUpperCase()

            if (!types[mutationName]) {
                logger.warn('no mutation name found for: %s', mutationName)
            }

            logger.debug('committing mutation %s', mutationName)

            commit(types[mutationName], value)
        }
    },

    [types.ON_BLOCK_SUBSCRIPTION] ({ dispatch }, block) {
        if (!block) {
            return
        }

        dispatch(types.SET_INITIAL_STATE, block)
    },

    /*
    [types.SET_BLOCKCHAIN_TIP] ({ commit, state }, height) {
        if (!height) {
            return
        }

        if (state.blockchainTip >= height) {
            return
        }

        commit(types.SET_BLOCKCHAIN_TIP, height)
    },
    */

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
            logger.warn('unrecognized client type given -> %s', type)
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
    status: (state) => state.status || {},
    isSynced: (state, getters) => getters.status.isSynced,
    isBlockchainSynced: (state, getters) => getters.status.isBlockchainSynced,
    isWinnersListSynced: (state, getters) => getters.status.isWinnersListSynced,
    isZnodeListSynced: (state, getters) => getters.status.isZnodeListSynced,
    averageBlockTimeInMilliSeconds: (state) => state.averageBlockTime,
    connections: (state) => state.connections,
    hasConnections: (state) => !!state.connections,
    // prototype only
    syncBlocksPerSecond: (state) => {
        const { startTimestamp, startBlockHeight, currentTimestamp } = state.syncBlocksPerSecond
        const { height: currentHeight } = state.currentBlock

        const blocksLoaded = currentHeight - startBlockHeight
        const time = currentTimestamp - startTimestamp

        return blocksLoaded / (time / 1000)
    },
    // prototype only
    estimatedTimeUntilSynced: (state, getters) => {
        const { height: currentHeight, timestamp: currentTimestamp } = state.currentBlock
        const estimatedTimestampWhenSynced = Date.now() + ((getters.estimatedBlockHeight - currentHeight) * getters.syncBlocksPerSecond * 1000)

        return isFinite(getters.estimatedBlockHeight) ? estimatedTimestampWhenSynced : 0
    },
    estimatedBlockHeight: (state, getters) => {
        const now = Date.now()
        const remainingTime = now - (getters.currentBlockTimestamp * 1000)
        const remainingBlocks = remainingTime / getters.averageBlockTimeInMilliSeconds

        return Math.floor(getters.currentBlockHeight + remainingBlocks)
    }

}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
