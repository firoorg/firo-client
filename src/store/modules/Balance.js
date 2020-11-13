import { fromPairs, isEqual, cloneDeep } from 'lodash'
import { createLogger } from 'lib/logger'
import { convertToSatoshi } from "lib/convert";

const logger = createLogger('firo:store:balance')

const state = {
    availablePublic: 0,
    unconfirmedPublic: 0,
    availablePrivate: 0,
    unconfirmedPrivate: 0,
    locked: 0,
    unspentMints: {}
}

const mutations = {
    updateBalance(state, balance) {
        logger.info("balance: %O", balance);
        state.availablePublic = balance.public.confirmed;
        state.unconfirmedPublic = balance.public.unconfirmed;
        state.availablePrivate = balance.private.confirmed;
        state.unconfirmedPrivate = balance.private.unconfirmed;
        state.locked = balance.public.locked;
        state.unspentMints =
            balance.unspentMints ? fromPairs(Object.entries(balance.unspentMints).map(([k, v]) => [convertToSatoshi(k), v])) : {};
    }
}

const getters = {
    unspentMints: (state) => state.unspentMints,

    available: (state) => state.availablePrivate,
    unconfirmedPrivate: (state) => state.unconfirmedPrivate,
    availablePublic: (state) => state.availablePublic,
    unconfirmedPublic: (state) => state.unconfirmedPublic,
    pending: (state) => state.unconfirmedPrivate + state.unconfirmedPublic,
    locked: (state) => state.locked,

    // Get the sum value of immature mining transactions.
    immature: (state, getters, rootState, rootGetters) => {
        const txs = Object.values(rootGetters['Transactions/transactions']);

        // Mined transactions take 100 blocks to mature.
        const maxHeight = rootGetters['Blockchain/currentBlockHeight'] - 100;
        const immatureTxs = txs.filter((tx) => tx.category === 'mined' && tx.blockHeight > maxHeight);

        return immatureTxs.reduce((a, tx) => a + tx.amount, 0);
    },

    // This is the maximum amount (in satoshi) that we can send privately. Consensus limits prohibit private
    // transactions spending over 500 XZC, and transactions with over 35 private inputs.
    maxPrivateSend: (state, getters) => {
        // Sort denominations from highest to lowest.
        const denominations = Object.keys(getters.unspentMints).sort((a, b) => b - a);

        let maxPrivateSend = 0;
        let inputsRemaining = 35;

        for (const denomination of denominations) {
            const amount = getters.unspentMints[denomination].confirmed || 0;

            if (inputsRemaining <= amount) {
                maxPrivateSend += denomination * inputsRemaining;
                break
            }

            maxPrivateSend += denomination * amount;
            inputsRemaining -= amount;

            if (inputsRemaining <= 0) {
                break;
            }
        }

        return Math.min(5e10, maxPrivateSend);
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
