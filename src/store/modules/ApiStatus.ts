import { isEqual } from 'lodash';

const state = {
    // ApiStatus from src/daemon/firod
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
    apiStatus: (state) => state.apiStatus,
    // 'main', 'test', or 'regtest'
    network: (state) => (state.apiStatus && state.apiStatus.data) ? state.apiStatus.data.network : undefined,
    // Do we have an apiStatus?
    hasApiStatus: (state): boolean => state.apiStatus && !!state.apiStatus.data,
    // Can our wallet be recovered from a mnemonic?
    hasMnemonic: (state): boolean => state.apiStatus && state.apiStatus.data && state.apiStatus.data.hasMnemonic,
    // Is the wallet locked? Returns undefined if not yet loaded.
    isLocked: (state): boolean | undefined => (state.apiStatus && state.apiStatus.data) ? state.apiStatus.data.walletLock : undefined,
    isReindexing: (state): boolean => state.apiStatus && state.apiStatus.data && state.apiStatus.data.reindexing,
    isLelantusAllowed: (state): boolean => state.apiStatus && state.apiStatus.data && state.apiStatus.data.isLelantusAllowed,
    API: (state): boolean => state.apiStatus && state.apiStatus.data && state.apiStatus.data.modules && state.apiStatus.data.modules.API,
    // We will return 0 if apiStatus hasn't yet loaded.
    localZnodeCount: (state): number => (state.apiStatus && state.apiStatus.data && state.apiStatus.data.Znode) ? state.apiStatus.data.Znode.localCount : 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    totalZnodeCount: (state): number => (state.apiStatus && state.apiStatus.data && state.apiStatus.data.Znode) ? state.apiStatus.data.Znode.totalCount : 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    enabledZnodeCount: (state): number => (state.apiStatus && state.apiStatus.data && state.apiStatus.data.Znode) ? state.apiStatus.data.Znode.enabledCount : 0
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
