import Vue from 'vue'
import * as types from '~/types/ZerocoinSpend'
// import { convertToCoin, convertToSatoshi } from '#/lib/convert'

const state = {
    isLoading: false,
    spendForm: {
        label: '',
        mints: {
        },
        address: null
    }
}
const mutations = {
    [types.IS_LOADING] (state, isLoading) {
        state.isLoading = isLoading
    },

    [types.SET_FORM_MINTS] (state, mints) {
        Vue.set(state.spendForm, 'mints', {
            ...state.spendForm.mints,
            ...mints
        })
    }
}
const actions = {
    [types.SET_FORM_MINTS] ({ commit, state }, mints) {
        console.log(mints)
        /*
        if (state.spendForm.mints === mints) {
            return
        }
        */

        commit(types.SET_FORM_MINTS, mints)
    }
}
const getters = {
    spendFormMints: (state) => state.spendForm.mints
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
