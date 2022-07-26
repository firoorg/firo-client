import {TXO} from "./Transactions";

const getters = {
    balances: (state, getters, rootState, rootGetters) => {
        let [availablePrivate, unconfirmedPrivate, unconfirmedPrivateChange, availablePublic, unconfirmedPublic,
             unconfirmedPublicChange, locked, immature] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;

        for (const txo of <TXO[]>rootGetters['Transactions/UTXOs']) {
            if (!txo.isToMe || txo.isSpent) continue;
            else if (txo.isLocked) locked += txo.amount;
            else if (txo.inputPrivacy == 'mined' && txo.validAt > nextHeight) immature += txo.amount;
            else if (txo.isPrivate && txo.validAt <= nextHeight) availablePrivate += txo.amount;
            else if (txo.isPrivate && txo.isChange) unconfirmedPrivateChange += txo.amount;
            else if (txo.isPrivate) unconfirmedPrivate += txo.amount;
            else if (txo.validAt <= nextHeight) availablePublic += txo.amount;
            else if (txo.isChange) unconfirmedPublicChange += txo.amount;
            else unconfirmedPublic += txo.amount;
        }

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
    pendingChange: (state, getters) => getters.balances.unconfirmedPrivateChange + getters.balances.unconfirmedPublicChange,
    incoming: (dtate, getters) => getters.balances.unconfirmedPrivate + getters.balances.unconfirmedPublic
}

export default {
    namespaced: true,
    getters
}
