import { ApiStatusData, ApiStatus } from "../../daemon/firod";
import { isEqual } from 'lodash';

const state = {
    apiStatus: {}
};

const mutations = {
    setApiStatus(state, apiStatus) {
        state.apiStatus = apiStatus;
    }
};

const actions = {
    setApiStatus({state, commit}, apiStatus) {
        // We first check if apiStatus has changed so we don't have to draw updates when it hasn't.
        if (!isEqual(state.apiStatus, apiStatus)) {
            commit('setApiStatus', apiStatus);
        }
    }
};

const getters = {
    apiStatus: (state): ApiStatus | {} => state.apiStatus,
    apiStatusData: (state): ApiStatusData | {} => (state.apiStatus && state.apiStatus.data) || {},
    version: (state, getters) => getters.apiStatusData.version || '(unknown)',
    currentBlockHeight: (state, getters): number => getters.apiStatusData.blocks || 0,
    lastestBlockTimestamp: (state, getters): number => getters.apiStatusData.latestBlockTimestamp || 0,
    block1: (state, getters): string => getters.apiStatusData.block1,
    network: (state, getters): 'main' | 'test' | 'regtest' => getters.apiStatusData.network,
    // Do we have an apiStatus?
    hasApiStatus: (state, getters): boolean => !!getters.network,
    // Can our wallet be recovered from a mnemonic?
    hasMnemonic: (state, getters): boolean => getters.apiStatusData.hasMnemonic,
    // Is the wallet locked? Returns undefined if not yet loaded.
    isLocked: (state, getters): boolean | undefined => getters.apiStatusData.walletLock,
    isReindexing: (state, getters): boolean => getters.apiStatusData.reindexing,
    isLelantusAllowed: (state, getters): boolean => !(getters.apiStatusData.disabledSporks || []).includes("lelantus"),
    API: (state, getters): boolean => (getters.apiStatusData.modules || {}).API,
    // We will return 0 if apiStatus hasn't yet loaded.
    localZnodeCount: (state, getters): number => (getters.apiStatusData.Znode || {}).localCount || 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    totalZnodeCount: (state, getters): number => (getters.apiStatusData.Znode || {}).totalCount || 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    enabledZnodeCount: (state, getters): number => (getters.apiStatusData.Znode || {}).enabledCount || 0,
    // This is the recommended fee per kb, or 1000 if it is undefined or lower than that.
    smartFeePerKb: (state, getters): number => Math.max(1000, getters.apiStatusData.smartFeePerKb || 1000),
    estimatedBlockHeight: (state, getters): number => Math.floor((Date.now() / 1000 - getters.lastestBlockTimestamp) / 300) + getters.currentBlockHeight,
    isBlockchainSynced: (state, getters): boolean => getters.network === 'regtest' || getters.apiStatusData.synced,
    connections: (state, getters): number => getters.apiStatusData.connections
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
