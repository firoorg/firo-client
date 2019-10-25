import { isEqual } from 'lodash';

const state = {
    // ApiStatus from src/daemon/zcoind
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
    isReindexing: (state): boolean => state.apiStatus.data.reindexing,
    // We will return 0 if apiStatus hasn't yet loaded.
    localZnodeCount: (state): number => state.apiStatus.data ? state.apiStatus.data.Znode.localCount : 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    totalZnodeCount: (state): number => state.apiStatus.data ? state.apiStatus.data.Znode.totalCount : 0,
    // We will return 0 if apiStatus hasn't yet loaded.
    enabledZnodeCount: (state): number => state.apiStatus.data ? state.apiStatus.data.Znode.enabledCount : 0
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}