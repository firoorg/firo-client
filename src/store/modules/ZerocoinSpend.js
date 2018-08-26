import Vue from 'vue'
import * as types from '~/types/ZerocoinSpend'
import allTypes from '~/types'

import Response from '~/mixins/Response'

import { convertToCoin, convertToSatoshi } from '#/lib/convert'

const spendZerocoinResponse = Response.module('spend zerocoin')

const state = {
    ...spendZerocoinResponse.state,

    isLoading: false,
    spendForm: {
        label: '',
        mints: {
        },
        address: null
    }
}

const mutations = {
    ...spendZerocoinResponse.mutations,

    [types.SPEND_ZEROCOIN] () {},

    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },

    [types.SET_FORM_MINTS] (state, mints) {
        Vue.set(state.spendForm, 'mints', {
            ...state.spendForm.mints,
            ...mints
        })
    },

    [types.CLEAR_FORM_MINTS] (state) {
        Vue.set(state.spendForm, 'mints', {})
    },

    [types.SET_FORM_LABEL] (state, label) {
        state.spendForm.label = label
    },

    [types.SET_FORM_ADDRESS] (state, address) {
        state.spendForm.address = address
    }
}
const actions = {
    ...spendZerocoinResponse.actions,

    [types.SET_FORM_MINTS] ({ commit, state }, mints) {
        console.log(mints)

        // todo validate equality

        commit(types.SET_FORM_MINTS, mints)
    },

    [types.SET_FORM_LABEL] ({ commit, getters }, value) {
        // todo check via getter

        commit(types.SET_FORM_LABEL, value)
    },

    [types.SET_FORM_ADDRESS] ({ commit, state }, value) {
        // todo check via getter

        commit(types.SET_FORM_ADDRESS, value)
    },

    [types.CLEAR_FORM] ({ dispatch, commit }) {
        dispatch(types.SET_FORM_LABEL, '')
        commit(types.CLEAR_FORM_MINTS)
        dispatch(types.SET_FORM_ADDRESS, '')
    },

    [types.SPEND_ZEROCOIN] ({ commit, dispatch, state }, { address, denominations, label, auth }) {
        commit(types.SPEND_ZEROCOIN, {
            data: {
                address,
                label,
                denomination: denominations.map((denom) => {
                    const { denomination, amount } = denom

                    return {
                        value: parseInt(denomination),
                        amount
                    }
                })
            },
            auth: {
                ...auth
            }
        })

        dispatch(allTypes.app.CLEAR_PASSPHRASE, null, { root: true })
    }
}

const getters = {
    ...spendZerocoinResponse.getters,

    isLoading: (state) => state.isLoading,
    spendFormMints: (state) => state.spendForm.mints,
    spendFormLabel: (state) => state.spendForm.label,
    spendFormMintsFormatted (state, getters) {
        if (!getters.spendFormMints) {
            return []
        }

        return Object.entries(getters.spendFormMints)
        // transform to [{denomination: '25', amount: 1}]
            .map((pair) => {
                const [ denomination, amount ] = pair

                return {
                    denomination,
                    amount,
                    cost: parseInt(denomination) * amount
                }
            })
            .filter((denom) => denom.amount)
    },
    spendFormMintCosts (state, getters) {
        return getters.spendFormMintsFormatted
            .reduce((accumulator, current) => accumulator + current.cost, 0)
    },
    spendFormMintCostsInSatoshi (state, getters) {
        return convertToSatoshi(getters.spendFormMintCosts)
    },
    spendFormMintsAsBaseCoin: (state, getters) => convertToCoin(getters.spendFormMintCostsInSatoshi),
    spendFormAddress: (state) => state.spendForm.address,
    spendFormIsEmpty: (state, getters) => (
        !getters.spendFormLabel &&
        !getters.spendFormAmount &&
        !getters.spendFormAddress
    )
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
