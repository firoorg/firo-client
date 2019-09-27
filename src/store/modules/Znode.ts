import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:store:Znode');

// zcoind will return information about Znodes in a slightly different format before we sync, but we don't need to show
// that in the UI, so we don't keep any state for it.
interface Znode {
    payeeAddress: string;
    rank: number;
    outpoint: {
        txid: string;
        // FIXME: Are we sure this is a string?
        index: string;
    };
    status: string;
    protocolVersion: number;
    lastSeen: number; // unix timestamp in milliseconds
    activeSince: number; // unix timestamp in milliseconds
    lastPaidTime: number | undefined; // unix timestamp in milliseconds, or undefined if never paid
    lastPaidBlock: number | undefined; // unix timestamp in milliseconds, or undefined if never paid
    authority: {
        ip: string;
        // FIXME: Are we sure this is a string?
        port: string;
    };
    isMine: boolean;
    label?: string; // Will be present if the Znode isMine.
    position?: number; // Will be present if the Znode isMine.
    qualify: {
        result: boolean;
        description?: "Is scheduled" | "Invalid nProtocolVersion" | "Too new" | "collateralAge < znCount"; // Will be present if !result.
    };
}

type ZnodeList = {[txid: string]: Znode};

const state = {
    znodes: <ZnodeList>{},
    // This is its own entry and not a getter for the lenth of znodes because it's supplied to us by zcoind before
    // the list of znodes is synced.
    znodeCount: 0
};

const mutations = {
    setStateWithZnodeList(state, znodeList: ZnodeList) {
        logger.debug(`Setting state with znodeList: ${Object.keys(znodeList).length} nodes`);
        state.znodes = znodeList;
    },

    setZnodeCount(state, znodeCount: number) {
        state.znodeCount = znodeCount;
    }
};

const actions = {
    setStateWithZnodeList({commit}, znodeList: ZnodeList) {
        commit('setStateWithZnodeList', znodeList);
    },

    setZnodeCount({commit}, znodeCount: number) {
        commit('setZnodeCount', znodeCount)
    }
}

const getters = {
    znodeCount: (state): number => state.znodeCount,
    znodes: (state): {[txid: string]: Znode} => state.znodes,
    myZnodes: (state): Znode[] => Object.values(<ZnodeList>state.znodes).filter(znode => znode.isMine),
    remoteZnodes: (state): Znode[] => Object.values(<ZnodeList>state.znodes).filter(znode => !znode.isMine),

    // in milliseconds
    paymentPeriod: (state, getters, rootState, rootGetters): number => {
        const enabledZnodeCount = Object.values(<ZnodeList>state.znodes).filter(znode => znode.status === 'ENABLED').length;
        const blockTime = rootGetters['Blockchain/averageBlockTimeInMilliSeconds'];
        return enabledZnodeCount / blockTime;
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
}