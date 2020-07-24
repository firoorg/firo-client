import { createLogger } from '#/lib/logger'
import { convertToSatoshi } from "#/lib/convert";

const logger = createLogger('zcoin:store:balance')

const state = {
    total: {
        all: 0,
        pending: 0,
        available: 0
    },
    xzc: {
        confirmed: 0,
        unconfirmed: 0,
        locked: 0
    },
    zerocoin: {
        confirmed: 0,
        unconfirmed: 0
    },
    unspentMints: {}
}

const mutations = {
    updateBalance(state, balance) {
        logger.debug('going to update balance %O', balance)

        // FIXME: This just aliases different names used in zcoind (where zcoind's public becomes our xzc, and its
        //        private becomes our zerocoin), which is very confusing. We should change names for us to be consistent
        //        with that throughout the program.
        const { all, pending, available } = balance.total
        const { confirmed: confirmedXzc, unconfirmed: unconfirmedXzc, locked } = balance.public
        const { confirmed: confirmedZerocoin, unconfirmed: unconfirmedZerocoin } = balance.private

        state.total = {
            ...state.total,
            all,
            pending,
            available
        }

        state.xzc = {
            ...state.xzc,
            confirmed: confirmedXzc,
            unconfirmed: unconfirmedXzc,
            locked
        }

        state.zerocoin = {
            ...state.zerocoin,
            confirmed: confirmedZerocoin,
            unconfirmed: unconfirmedZerocoin
        }

        state.unspentMints = balance.unspentMints || {};
    }
}

const getters = {
    total: (state) => state.total.all,
    immatureXzc: (state, getters, rootState, rootGetters) => {
        const txs = Object.values(rootGetters['Transactions/transactions']);

        // Mined transactions take 100 blocks to mature.
        const maxHeight = rootGetters['Blockchain/currentBlockHeight'] - 100;
        const immatureTxs = txs.filter((tx) => tx.category === 'mined' && tx.blockHeight > maxHeight);

        return immatureTxs.reduce((a, tx) => a + tx.amount, 0);
    },
    availableXzc: (state) => state.xzc.confirmed - state.xzc.locked,
    unconfirmedXzc: (state) => state.xzc.unconfirmed,
    lockedXzc: (state) => state.xzc.locked,
    availableZerocoin: (state) => state.zerocoin.confirmed,
    unconfirmedZerocoin: (state) => state.zerocoin.unconfirmed,
    confirmedXzcZerocoinRatio: (state, getters) => getters.availableZerocoin / getters.total,
    xzcZerocoinRatio: (state, getters) =>
        (getters.availableZerocoin + getters.unconfirmedZerocoin) / (getters.availableXzc + getters.unconfirmedXzc),
    unspentMints: (state) => state.unspentMints,

    // This is the maximum amount (in satoshi) that we can send privately. Consensus limits prohibit private
    // transactions spending over 500 XZC, and transactions with over 35 private inputs.
    maxPrivateSend: (state) => {
        // Sort denominations from highest to lowest.
        const denominations = Object.keys(state.unspentMints).sort((a, b) => Number(b) - Number(a));

        let maxPrivateSend = 0;
        let inputsRemaining = 35;

        for (const denomination of denominations) {
            const value = convertToSatoshi(denomination);
            const amount = state.unspentMints[denomination].confirmed || 0;

            if (inputsRemaining <= amount) {
                maxPrivateSend += value * inputsRemaining;
                break
            }

            maxPrivateSend += value * amount;
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
