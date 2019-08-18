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
    denominationTypes: [0.5, 0.1, 0.5, 1, 10, 25, 100]
}

const mutations = {
    ...isLoading.mutations,
    ...spendZerocoinResponse.mutations,

    [types.SPEND_ZEROCOIN] () {},
}
const actions = {
    ...spendZerocoinResponse.actions,

    [types.SPEND_ZEROCOIN] ({ commit, dispatch, state }, {label, address, amount, auth}) {
        commit(types.SPEND_ZEROCOIN, {label, address, amount, auth})
    }
}

const getters = {
    ...isLoading.getters,
    ...spendZerocoinResponse.getters,

    denominationTypes: (state) => state.denominationTypes,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
