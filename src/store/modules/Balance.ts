import {TXO} from "./Transactions";

const getters = {
    balances: (state, getters, rootState, rootGetters) => {
        let [availablePrivate, unconfirmedPrivate, unconfirmedPrivateChange, availablePublic, unconfirmedPublic,
            unconfirmedPublicChange, locked, immature, availableSpark] = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];
        let nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;

        for (const txo of <TXO[]>rootGetters['Transactions/UTXOs']) {
            if ((txo.scriptType == "spark-mint" || txo.scriptType == "spark-smint")) {availableSpark += txo.amount; console.log("aaaaaaaaaaaaaaaaaaaaa",txo)}
            if (!txo.isToMe || txo.isSpent) continue;
            else if (txo.isElysiumReferenceOutput) locked += txo.amount;
            else if (txo.isLocked) locked += txo.amount;
            else if (txo.inputPrivacy == 'mined' && txo.validAt > nextHeight) immature += txo.amount;
            else if (txo.isPrivate && txo.validAt <= nextHeight) availablePrivate += txo.amount;
            else if (txo.isPrivate && txo.isChange) unconfirmedPrivateChange += txo.amount;
            else if (txo.isPrivate) unconfirmedPrivate += txo.amount;
            else if (txo.validAt <= nextHeight) availablePublic += txo.amount;
            else if (txo.isChange) unconfirmedPublicChange += txo.amount;
            else unconfirmedPublic += txo.amount;
        }
        console.log("availableSpark", availableSpark);
        return {
            availablePrivate,
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
