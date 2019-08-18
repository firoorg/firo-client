import * as types from '~/types/Balance'

import { createLogger } from '#/lib/logger'

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
    }
}

const mutations = {
    [types.UPDATE_BALANCE] (state, balance) {
        logger.debug('going to update balance %O', balance)

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
    }
}

const actions = {
    [types.SET_INITIAL_STATE] ({ dispatch, commit, state }, initialState) {
        dispatch(types.UPDATE_BALANCE, initialState)
    },

    [types.ON_BALANCE_SUBSCRIPTION] ({ dispatch }, balance) {
        dispatch(types.UPDATE_BALANCE, balance)
    },

    [types.UPDATE_BALANCE] ({ commit }, balance) {
        commit(types.UPDATE_BALANCE, balance)
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
    unconfirmedZerocoin: (state, getters, rootState, rootGetters) => {
        // FIXME: This is a workaround because zcoind does not update unconfirmed private balance until one block is
        //        mined.
        const txs = Object.values(rootGetters['Transactions/transactions']);

        return txs
            .filter(tx => tx.category === 'mint' && !tx.blockHeight)
            .reduce((a,x) => a + x.amount, 0) + state.zerocoin.unconfirmed;
    },
    confirmedXzcZerocoinRatio: (state, getters) => getters.availableZerocoin / getters.total
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
