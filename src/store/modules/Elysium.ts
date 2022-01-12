import Vue from "vue";
import {getAppSettings} from "../../lib/utils";
import {ElysiumData, ElysiumPropertyData} from "../../daemon/firod";

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

interface ElysiumBalances {
    [id: number]: {
        priv: number,
        privUnconfirmed: number,
        pub: {
            [address: string]: number
        };
    };
}

const getters = {
    balances: (state, getters, rootState, rootGetters): ElysiumBalances => {
        const r: ElysiumBalances = {};
        for (const txo of rootGetters['Transactions/TXOs']) {
            const e: ElysiumData = txo.elysium;
            if (!e || (txo.blockHeight && !e.valid) || txo.scriptType !== 'elysium' || !e.property || !e.amount) continue;

            const id = e.property.id;
            r[id] = r[id] || {priv: 0, privUnconfirmed: 0, pub: {}};
            if (e.sender && txo.isFromMe && !r[id].pub[e.sender]) r[id].pub[e.sender] = 0;
            if (e.isToMe && !r[id].pub[e.receiver]) r[id].pub[e.receiver] = 0;

            if (e.type == "Lelantus Mint" && txo.isFromMe) {
                if (e.valid) r[id].priv += e.amount;
                else r[id].privUnconfirmed += e.amount;

                r[id].pub[e.sender] -= e.amount;
            } else if (e.type == "Simple Send") {
                if (txo.isFromMe) r[id].pub[e.sender] -= e.amount;
                if (e.valid && e.isToMe) r[id].pub[e.receiver] += e.amount;
            } else if (e.type == "Lelantus JoinSplit") {
                if (txo.isFromMe) r[id].priv -= e.amount;
                if (e.valid && e.isToMe) r[id].pub[e.receiver] += e.amount;
            } else if (e.type == "Create Property - Fixed") {
                if (txo.isFromMe && e.valid) r[id].pub[e.sender] += e.amount;
            } else if (e.type == "Grant Property Tokens") {
                if (e.isToMe && e.valid) r[id].pub[e.receiver] += e.amount;
            }
        }
        return r;
    },

    aggregatedBalances: (state, getters) => {
        const r = {};

        for (const token of Object.keys(getters.balances)) {
            r[token] = {
                priv: getters.balances[token].priv,
                pending: (<any>Object.values(getters.balances[token].pub)).reduce((a, x) => a + x, 0)
            };
        }

        return r;
    },

    tokensNeedingAnonymization: (state, getters) => {
        const r = [];
        for (const token of Object.keys(getters.balances)) {
            for (const addr of Object.keys(getters.balances[token].pub)) {
                r.push([Number(token), addr]);
            }
        }
        return r;
    },

    selectedTokens: (state) => Object.keys(state.selectedTokens).map(Number).sort((a, b) => a-b),
    tokenData: (state) => state.tokenData
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
