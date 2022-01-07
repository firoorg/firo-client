import Vue from "vue";
import {getAppSettings} from "../../lib/utils";
import {ElysiumPropertyData} from "../../daemon/firod";

const state = {
    selectedTokens: <number[]>[],
    tokenData: <{[id: number]: ElysiumPropertyData}>{}
};

const mutations = {
    addTokenData(state, tokenData: ElysiumPropertyData[]) {
        for (const token of tokenData) {
            Vue.set(state.tokenData, token.id, token);
        }
    },

    addSelectedTokens(state, tokens: number[]) {
        for (const token of tokens) Vue.set(state.selectedTokens, token, true);
    },

    removeSelectedToken(state, token: number) {
        Vue.delete(state.selectedTokens, token);
    }
};

const actions = {
    async addSelectedTokens({commit, getters}, tokens: number[]) {
        await commit('addSelectedTokens', tokens);
        await getAppSettings().set('selectedElysiumTokens', getters.selectedTokens.concat(tokens));
    },

    async removeSelectedToken({commit, getters}, token: number) {
        await commit('removeSelectedToken', token);
        await getAppSettings().set('selectedElysiumTokens', getters.selectedTokens.filter(tkn => tkn !== token));
    }
};

const getters = {
    balances: (state, getters, rootState, rootGetters): {[id: number]: {private: number, public: number, pending: number}} => {
        const nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;

        const r = {};
        for (const txo of rootGetters['Transactions/TXOs']) {
            if (!txo.elysium || txo.scriptType !== 'elysium' || !txo.elysium.property || !txo.elysium.amount) continue;
            if (txo.isFromMe && txo.isToMe) continue;

            r[txo.elysium.property.id] = {private: 0, public: 0, pending: 0};
            const amount = txo.isFromMe ? -txo.elysium.amount : txo.elysium.amount;
        }
        return r;
    },

    selectedTokens: (state) => Object.keys(state.selectedTokens).map(Number).sort(),
    tokenData: (state) => state.tokenData
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
