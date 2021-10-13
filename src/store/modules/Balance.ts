import {TXO} from "./Transactions";

const getters = {
    balances: (state, getters, rootState, rootGetters) => {
        let [availablePrivate, unconfirmedPrivate, availablePublic, unconfirmedPublic, locked, immature] = [0, 0, 0, 0, 0, 0, 0];
        let nextHeight: number = rootGetters['ApiStatus/currentBlockHeight'] + 1;

        for (const txo of <TXO[]>rootGetters['Transactions/TXOs']) {
            if (!txo.isToMe || txo.isSpent) continue;
            else if (txo.isLocked) locked += txo.amount;
            else if (txo.inputPrivacy == 'mined' && txo.validAt > nextHeight) immature += txo.amount;
            else if (txo.isPrivate && txo.validAt <= nextHeight) availablePrivate += txo.amount;
            else if (txo.isPrivate) unconfirmedPrivate += txo.amount;
            else if (txo.validAt <= nextHeight) availablePublic += txo.amount;
            else unconfirmedPublic += txo.amount;
        }

        return {
            availablePrivate,
            unconfirmedPrivate,
            availablePublic,
            unconfirmedPublic,
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
    pending: (state, getters) => getters.unconfirmedPrivate + getters.unconfirmedPublic
}

export default {
    namespaced: true,
    getters
}
