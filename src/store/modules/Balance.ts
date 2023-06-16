import {TXO} from "./Transactions";

const getters = {
    balances: (state, getters, rootState, rootGetters) => {
        let [availablePrivate, unconfirmedPrivate, unconfirmedPrivateChange, availablePublic, unconfirmedPublic,
            unconfirmedPublicChange, locked, immature, availableLelantus, unconfirmedLelantus, unconfirmedLelantusChange, 
            availableSpark, unconfirmedSpark, unconfirmedSparkChange] = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];
        let nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;
        let isSparkAllowed: boolean = rootGetters['ApiStatus/isSparkAllowed'];

        for (const txo of <TXO[]>rootGetters['Transactions/UTXOs']) {
            if (!txo.isToMe || txo.isSpent) continue;
            else if (txo.isElysiumReferenceOutput) locked += txo.amount;
            else if (txo.isLocked) locked += txo.amount;
            else if (txo.inputPrivacy == 'mined' && txo.validAt > nextHeight) immature += txo.amount;
            else if (txo.isPrivate && txo.validAt <= nextHeight && (txo.scriptType === 'lelantus-mint' || txo.scriptType === 'lelantus-jmint')) availableLelantus += txo.amount;
            else if (txo.isPrivate && txo.validAt <= nextHeight && (txo.scriptType === 'spark-mint' || txo.scriptType === 'spark-smint')) availableSpark += txo.amount;
            else if (txo.isPrivate && txo.isChange && (txo.scriptType === 'lelantus-mint' || txo.scriptType === 'lelantus-jmint')) unconfirmedLelantusChange += txo.amount;
            else if (txo.isPrivate && txo.isChange && (txo.scriptType === 'spark-mint' || txo.scriptType === 'spark-smint')) unconfirmedSparkChange += txo.amount;
            else if (txo.isPrivate && (txo.scriptType === 'lelantus-mint' || txo.scriptType === 'lelantus-jmint')) unconfirmedLelantus += txo.amount;
            else if (txo.isPrivate && (txo.scriptType === 'spark-mint' || txo.scriptType === 'spark-smint')) unconfirmedSpark += txo.amount;
            else if (txo.validAt <= nextHeight) availablePublic += txo.amount;
            else if (txo.isChange) unconfirmedPublicChange += txo.amount;
            else unconfirmedPublic += txo.amount;
        }

        availablePrivate = isSparkAllowed ? availableSpark : availableLelantus;
        unconfirmedPrivate = isSparkAllowed ? unconfirmedSpark : unconfirmedLelantus;
        unconfirmedPrivateChange = isSparkAllowed ? unconfirmedSparkChange : unconfirmedLelantusChange;

        return {
            availablePrivate,
            availableLelantus,
            unconfirmedPrivate,
            unconfirmedPrivateChange,
            availablePublic,
            unconfirmedPublic,
            unconfirmedPublicChange,
            locked,
            immature
        };
    },

    availablePrivate: (state, getters) => getters.balances.availablePrivate,
    availableLelantus: (state, getters) => getters.balances.availableLelantus,
    unconfirmedPrivate: (state, getters) => getters.balances.unconfirmedPrivate,
    availablePublic: (state, getters) => getters.balances.availablePublic,
    unconfirmedPublic: (state, getters) => getters.balances.unconfirmedPublic,
    // This includes unconfirmed and immature locked funds.
    locked: (state, getters) => getters.balances.locked,
    immature: (state, getters) => getters.balances.immature,
    pendingChange: (state, getters) => getters.balances.unconfirmedPrivateChange + getters.balances.unconfirmedPrivate + getters.balances.unconfirmedPublicChange,
    incoming: (dtate, getters) =>  getters.balances.unconfirmedPublic,
}

export default {
    namespaced: true,
    getters
}
