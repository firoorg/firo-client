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
    estimatedTimeUntilSynced: null
}

export const mutations = {
    updateBlockchain(state, data) {
        state.currentBlock.height = data.currentBlock.height;
        state.currentBlock.timestamp = data.currentBlock.timestamp;
        state.connections = data.connections;
        state.type = data.type;
        state.averageBlockTime = data.avgBlockTime;
        state.estimatedTimeUntilSynced = data.timeUntilSynced || null;
        state.status.isBlockchainSynced = data.status.isBlockchainSynced;
        state.status.isFailed = data.status.isFailed;
        state.status.isSynced = data.status.isSynced;
        state.status.isWinnersListSynced = data.status.isWinnersListSynced;
        state.status.isZnodeListSynced = data.status.isZnodeListSynced;
    }
}

export const actions = {
    updateBlockchain({commit}, data) {
        commit('updateBlockchain', data);
    }
}

export const getters = {
    currentBlockHeight: (state) => state.currentBlock.height,
    currentBlockTimestamp: (state) => state.currentBlock.timestamp,
    status: (state) => state.status || {},
    isSynced: (state, getters) => getters.status.isSynced,
    isBlockchainSynced: (state, getters, rootState, rootGetters) => getters.status.isBlockchainSynced || rootGetters['ApiStatus/network'] === 'regtest',
    isWinnersListSynced: (state, getters) => getters.status.isWinnersListSynced,
    isZnodeListSynced: (state, getters) => getters.status.isZnodeListSynced,
    averageBlockTimeInMilliSeconds: (state) => state.averageBlockTime,
    connections: (state) => state.connections,
    hasConnections: (state) => !!state.connections,
    estimatedTimeUntilSynced: (state) => state.estimatedTimeUntilSynced,
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
