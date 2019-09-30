const state = {
    // ApiStatus from src/daemon/zcoind
    apiStatus: {}
};

const mutations = {
    setApiStatus(state, apiStatus) {
        state.apiStatus = apiStatus;
    }
};

const getters = {
    apiStatus: (state) => state.apiStatus,
    isSynced: (state): boolean => !!(state.apiStatus && state.apiStatus.data && state.apiStatus.data.synced)
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
}