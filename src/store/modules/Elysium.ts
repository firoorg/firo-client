import {ElysiumData, ElysiumPropertyData} from "../../daemon/firod";
import {cloneDeep} from "lodash";
import {TXO} from "./Transactions";

export interface ExtendedElysiumPropertyData extends ElysiumPropertyData {
    nameMinusTicker: string;
    ticker: string;
}

const state = {
    hasModifiedSelectedTokens: false,
    allSelectedTokens: <{[block1: string]: string[]}>{},
    tokenData: <{[id: number]: ExtendedElysiumPropertyData}>{}
};

const mutations = {
    addTokenData(state, tokenData: ElysiumPropertyData[]) {
        for (const token of tokenData) {
            const m = token.name.match(/^(.*) \(([A-Z0-9]{1,4})\)$/);
            state.tokenData[token.creationTx] = {...token, nameMinusTicker: m ? m[1] : token.name, ticker: m ? m[2] : `E:${token.id || '...'}`};
        }
    },

    initSelectedTokens(state, allSelectedTokens) {
        state.allSelectedTokens = allSelectedTokens;
    },

    addSelectedTokens(state, [block1, tokens]: [string, number[]]) {
        const b = [...(state.allSelectedTokens[block1]||[])];
        for (const token of tokens) if (!b.includes(token)) b.push(token);
        state.hasModifiedSelectedTokens = true;
        state.allSelectedTokens[block1] = b.sort();
    },

    removeSelectedTokens(state, [block1, tokens]: [string, number[]]) {
        state.hasModifiedSelectedTokens = true;
        state.allSelectedTokens[block1] = (state.allSelectedTokens[block1] || []).filter(tk => !tokens.includes(tk));
    }
};

const actions = {
    addSelectedTokens({commit, rootGetters}, tokens: string[]) {
        commit('addSelectedTokens', [rootGetters['ApiStatus/block1'], tokens]);
    },

    removeSelectedTokens({commit, rootGetters}, tokens: string[]) {
        commit('removeSelectedTokens', [rootGetters['ApiStatus/block1'], tokens]);
    }
};

interface ElysiumBalances {
    [id: string]: {
        priv: bigint,
        privUnconfirmed: bigint,
        pub: {
            [address: string]: bigint
        };
    };
}

const getters = {
    balances: (state, getters, rootState, rootGetters): ElysiumBalances => {
        const r: ElysiumBalances = {};
        for (const txo of <TXO[]>rootGetters['Transactions/TXOs']) {
            const e: ElysiumData = txo.elysium;
            if (!e || (txo.blockHeight && !e.valid) || txo.scriptType !== 'elysium' || !e.property || !e.amount) continue;

            const id = e.property.creationTx;
            r[id] = r[id] || {priv: 0n, privUnconfirmed: 0n, pub: {}};
            if (e.sender && txo.isFromMe && !r[id].pub[e.sender]) r[id].pub[e.sender] = 0n;
            if (e.isToMe && !r[id].pub[e.receiver]) r[id].pub[e.receiver] = 0n;

            if (e.type == "Lelantus Mint" && txo.isFromMe) {
                if (e.valid) r[id].priv += e.amount;
                else if (!txo.blockHeight) r[id].privUnconfirmed += e.amount;

                r[id].pub[e.sender] -= e.amount;
            } else if (e.type == "Simple Send") {
                if (txo.isFromMe && (e.valid || !txo.blockHeight)) r[id].pub[e.sender] -= e.amount;
                if (e.valid && e.isToMe) r[id].pub[e.receiver] += e.amount;
            } else if (e.type == "Lelantus JoinSplit") {
                if (txo.isFromMe && (e.valid || !txo.blockHeight)) r[id].priv -= e.amount;
                if (txo.isFromMe && !txo.blockHeight) {
                    if (e.joinmintAmount >= 0n) {
                        r[id].priv -= e.joinmintAmount;
                        r[id].privUnconfirmed += e.joinmintAmount;
                    } else {
                        console.error(`Transaction ${txo.txid} has an erroneous joinmintAmount.`);
                    }
                }

                if (e.valid && e.isToMe) r[id].pub[e.receiver] += e.amount;
                else if (e.isToMe && !txo.blockHeight) r[id].privUnconfirmed += e.amount;
            } else if (e.type == "Create Property - Fixed") {
                if (txo.isFromMe && e.valid) r[id].pub[e.sender] += e.amount;
                // TODO: Change the names here, as the unconfirmed funds are not actually private. Still, it's how we
                //       want to treat them.
                else if (txo.isFromMe && !txo.blockHeight) r[id].privUnconfirmed += e.amount;
            } else if (e.type == "Grant Property Tokens") {
                if (e.isToMe && e.valid) r[id].pub[e.receiver] += e.amount;
            }
        }
        return r;
    },

    aggregatedBalances: (state, getters) => {
        const r = {};

        for (const [token, data] of Object.entries(<ElysiumBalances>getters.balances)) {
            r[token] = {
                priv: data.priv,
                pub: Object.values(data.pub).reduce((a, x) => a + x, 0n),
                pending: data.privUnconfirmed
            };
        }

        return r;
    },

    tokensNeedingAnonymization: (state, getters) => {
        const r = [];
        for (const [token, data] of Object.entries(<ElysiumBalances>getters.balances)) {
            if (!getters.selectedTokens.includes(token)) continue;
            for (const [addr, pubValue] of Object.entries(data.pub)) {
                if (pubValue) r.push([token, addr]);
            }
        }
        return r;
    },

    // This is the total issued amount of property tokens created by us. Note that it is possible to change the manager
    // of an Elysium token, and if this is done, the data returned here will be wrong. It's not possible to do that from
    // our UI.
    totalIssued: (state, getters, rootState, rootGetters): {[property: number]: bigint} => {
        const r: {[property: string]: bigint} = {};
        for (const txo of <TXO[]>rootGetters['Transactions/TXOs']) {
            const p = txo.elysium && txo.elysium.property && txo.elysium.property.creationTx;
            if (
                !p ||
                txo.scriptType != "elysium" ||
                !txo.isFromMe ||
                (!txo.elysium.valid && txo.blockHeight) ||
                txo.elysium.type != "Grant Property Tokens"
            ) continue;

            r[p] = (r[p] || 0n) + (txo.elysium.amount || 0n);
        }
        return r;
    },

    showAllTokens: () => false,
    allSelectedTokens: (state) => state.allSelectedTokens,
    hasModifiedSelectedTokens: (state) => state.hasModifiedSelectedTokens,
    selectedTokens: (state, getters, rootState, rootGetters) => getters.allSelectedTokens[rootGetters['ApiStatus/block1']] || [],
    selectedAndOwnedTokens: (state, getters) =>
        [...Object.keys(getters.aggregatedBalances), ...getters.selectedTokens].sort().reduce((a, x) => a[a.length-1] == x ? a : [...a, x], []),
    tokenData: (state) => state.tokenData
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
