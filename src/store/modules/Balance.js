import * as types from '~/types/Balance'

import Debug from 'debug'
const debug = Debug('zcoin:store:balance')

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
        debug('going to update balance', balance)

        const { total, xzc, zerocoin } = balance
        const { all, pending, available } = total
        const { confirmedXzc, unconfirmedXzc, locked } = xzc
        const { confirmedZerocoin, unconfirmedZerocoin } = zerocoin

        state = {
            total: {
                ...state.total,
                all,
                pending,
                available
            },
            xzc: {
                ...state.xzc,
                confirmed: confirmedXzc,
                unconfirmed: unconfirmedXzc,
                locked
            },
            zerocoin: {
                ...state.zerocoin,
                confirmed: confirmedZerocoin,
                unconfirmed: unconfirmedZerocoin
            }
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
        const { total, xzc, zerocoin } = balance

        commit(types.UPDATE_BALANCE, {
            total,
            xzc,
            zerocoin
        })
    }
}

const getters = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
