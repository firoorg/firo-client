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
    isReindexing: (state): boolean => state.apiStatus.data.reindexing
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
}