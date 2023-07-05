import { ApiStatusData, Network } from "../../daemon/firod";
import { isEqual } from 'lodash';

const state = {
    apiStatus: {
        disabledSporks: [],
        blocks: 0
    }
};

const mutations = {
    setApiStatus(state, apiStatus) {
        state.apiStatus = apiStatus;
    }
};

const actions = {
    setApiStatus({state, commit, dispatch}, {data: apiStatus}) {
        const msgs = apiStatus.newLogMessages;
        if (msgs.length) {
            commit('App/appendLogMessages', msgs, {root: true});
            delete apiStatus.newLogMessages;
        }

        // We first check if apiStatus has changed so we don't have to draw updates when it hasn't. Also make sure not
        // to update to apiStatuses oldest than the latest. (This is possible due to the asynchronous nature of the
        // updates.)
        if (!isEqual(state.apiStatus, apiStatus) && apiStatus.blocks >= state.apiStatus.blocks) {
            commit('setApiStatus', apiStatus);
        }
    }
};

const getters = {
    apiStatus: (state): ApiStatusData => state.apiStatus,
    version: (state) => state.apiStatus.version,
    currentBlockHeight: (state): number => state.apiStatus.blocks,
    latestBlockTimestamp: (state): number => state.apiStatus.latestBlockTimestamp,
    block1: (state): string => state.apiStatus.block1,
    network: (state): Network => state.apiStatus.network,
    // Can our wallet be recovered from a mnemonic?
    hasMnemonic: (state): boolean => state.apiStatus.hasMnemonic,
    // Is the wallet locked? Returns undefined if not yet loaded.
    isLocked: (state): boolean | undefined => state.apiStatus.walletLock,
    isReindexing: (state): boolean => state.apiStatus.reindexing,
    isLelantusAllowed: (state): boolean => !state.apiStatus.disabledSporks.includes("lelantus"),
    isSparkAllowed: (state, getters): boolean => getters.apiStatus.isSpark,
    smartFeePerKb: (state): bigint => state.apiStatus.smartFeePerKb,
    isBlockchainSynced: (state): boolean => ['regtest', 'regtest-ql'].includes(state.apiStatus.network) || state.apiStatus.synced,
    connections: (state): number => state.apiStatus.connections
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
