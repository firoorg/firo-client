import {TXO} from "./Transactions";

const getters = {
    balances: (state, getters, rootState, rootGetters) => {
        let [availablePublic, unconfirmedPublic, unconfirmedPublicChange, locked, immature, availableLelantus, unconfirmedLelantus, unconfirmedLelantusChange, availableSpark, unconfirmedSpark, unconfirmedSparkChange] = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];
        let nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;

        for (const txo of <TXO[]>rootGetters['Transactions/UTXOs']) {
            if (!txo.isToMe || txo.isSpent) continue;
            else if (txo.isElysiumReferenceOutput) locked += txo.amount;
            else if (txo.isLocked) locked += txo.amount;
            else if (txo.inputPrivacy == 'mined' && txo.validAt > nextHeight) immature += txo.amount;
            else if (txo.privacyUse == 'lelantus' && txo.validAt <= nextHeight) availableLelantus += txo.amount;
            else if (txo.privacyUse == 'spark' && txo.validAt <= nextHeight) availableSpark += txo.amount;
            else if (txo.privacyUse == 'lelantus' && txo.isChange) unconfirmedLelantusChange += txo.amount;
            else if (txo.privacyUse == 'spark' && txo.isChange) unconfirmedSparkChange += txo.amount;
            else if (txo.privacyUse == 'lelantus') unconfirmedLelantus += txo.amount;
            else if (txo.privacyUse == 'spark') unconfirmedSpark += txo.amount;
            else if (txo.validAt <= nextHeight) availablePublic += txo.amount;
            else if (txo.isChange) unconfirmedPublicChange += txo.amount;
            else unconfirmedPublic += txo.amount;
        }

        return {
            availableSpark,
            availableLelantus,
            availablePublic,
            unconfirmedLelantus,
            unconfirmedSpark,
            unconfirmedPublic,
            unconfirmedLelantusChange,
            unconfirmedSparkChange,
            unconfirmedPublicChange,
            locked,
            immature
        };
    },

    availablePrivate: (state, getters, rootState, rootGetters) => rootGetters['ApiStatus/isSparkAllowed'] ? getters.balances.availableSpark : getters.balances.availableLelantus,
    unconfirmedPrivate: (state, getters, rootState, rootGetters) => rootGetters['ApiStatus/isSparkAllowed'] ? getters.balances.unconfirmedSpark : getters.balances.unconfirmedLelantus,
    availablePublic: (state, getters) => getters.balances.availablePublic,
    unconfirmedPublic: (state, getters) => getters.balances.unconfirmedPublic,
    // This includes unconfirmed and immature locked funds.
    locked: (state, getters) => getters.balances.locked,
    immature: (state, getters) => getters.balances.immature,
    pendingChange: (state, getters, rootState, rootGetters) => (rootGetters['ApiStatus/isSparkAllowed'] ? getters.balances.unconfirmedSparkChange : getters.balances.unconfirmedLelantusChange) + getters.balances.unconfirmedPublicChange,
    pendingConversion: (state, getters, rootState, rootGetters) => rootGetters['ApiStatus/isSparkAllowed'] ? getters.balances.availableLelantus : 0n,
    incoming: (state, getters) =>  getters.balances.unconfirmedPublic + getters.balances.unconfirmedSpark + getters.balances.unconfirmedLelantus,
}

export default {
    namespaced: true,
    getters
}
