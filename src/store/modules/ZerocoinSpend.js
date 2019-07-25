import Vue from 'vue'
import * as types from '~/types/ZerocoinSpend'
import allTypes from '~/types'
import { formatDenominationPairs } from '~/utils'

import IsLoading from '~/mixins/IsLoading'
import Response from '~/mixins/Response'

import { convertToCoin, convertToSatoshi } from '#/lib/convert'

const isLoading = IsLoading.module('')
const spendZerocoinResponse = Response.module('spend zerocoin')

const state = {
    ...isLoading.state,
    ...spendZerocoinResponse.state,

    isLoading: false,
    spendForm: {
        label: '',
        amount: null,
        address: null
    },
    denominationTypes: [0.1, 0.5, 1, 10, 25, 100],
}

const mutations = {
    ...isLoading.mutations,
    ...spendZerocoinResponse.mutations,

    [types.SPEND_ZEROCOIN] () {},

    /*
    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },
    */

    [types.SET_FORM_AMOUNT] (state, amount) {
        state.spendForm.amount = amount
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

    [types.SET_FORM_AMOUNT] ({ commit }, amount) {

        // todo validate equality

        commit(types.SET_FORM_AMOUNT, amount)
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
        commit(types.SET_FORM_AMOUNT, null)
        dispatch(types.SET_FORM_ADDRESS, '')
    },

    [types.SPEND_ZEROCOIN] ({ commit, dispatch, state }, {label, address, amount, auth}) {
        commit(types.SPEND_ZEROCOIN, {label, address, amount, auth})

        dispatch(allTypes.app.CLEAR_PASSPHRASE, null, { root: true })
    }
}

const getters = {
    ...isLoading.getters,
    ...spendZerocoinResponse.getters,

    // isLoading: (state) => state.isLoading,
    spendFormAmount: (state) => state.spendForm.amount,
    spendFormLabel: (state) => state.spendForm.label,
    spendFormAddress: (state) => state.spendForm.address,
    spendFormIsEmpty: (state, getters) => (
        !getters.spendFormLabel &&
        !getters.spendFormAmount &&
        !getters.spendFormAddress
    ),
    denominationTypes: (state) => state.denominationTypes,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
