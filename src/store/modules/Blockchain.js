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
        if (state.currentBlock.height !== data.currentBlock.height) {
            console.debug(`new block height: ${data.currentBlock.height}`);
        }

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

export const getters = {
    currentBlockHeight: (state) => state.currentBlock ? state.currentBlock.height : 0,
    currentBlockTimestamp: (state, getters, rootState, rootGetters) => {
        if (state.currentBlock && state.currentBlock.height) {
            return state.currentBlock.timestamp;
        }

        // If the current block hasn't been loaded yet, use a hardcoded value set to the first Firo block mined.
        switch (rootGetters['App/firoClientNetwork']) {
            case 'mainnet':
                // Sep 28, 2016 7:00:13 AM
                return 1475046013;

            case 'test':
                // Oct 10, 2018 3:19:09 PM
                return 1539159549;

            case 'regtest':
                return 0;
        }
    },
    status: (state) => state.status || {},
    isSynced: (state, getters) => getters.status.isSynced,
    isBlockchainSynced: (state, getters, rootState, rootGetters) => getters.status.isBlockchainSynced || rootGetters['ApiStatus/network'] === 'regtest',
    isWinnersListSynced: (state, getters) => getters.status.isWinnersListSynced,
    isZnodeListSynced: (state, getters) => getters.status.isZnodeListSynced,
    averageBlockTimeInMilliSeconds: (state) => state.averageBlockTime * 1000,
    connections: (state) => state.connections,
    hasConnections: (state) => !!state.connections,
    estimatedTimeUntilSynced: (state) => state.estimatedTimeUntilSynced,

}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
