import Vue from 'vue';
import {cloneDeep} from 'lodash';
import {MasternodeEvent} from '../../daemon/firod';
import { createLogger } from '../../lib/logger'
const logger = createLogger('firo:store:Masternode');

const state = {
    masternodes: <{[proTxHash: string]: MasternodeEvent}>{},
};

const mutations = {
    updateMasternode(state, mn: MasternodeEvent) {
        Vue.set(state.masternodes, mn.proTxHash, mn);
    },
    updateMasternodeList(state, mnList: Array<MasternodeEvent>) {
        const masternodes = cloneDeep(state.masternodes);
        for (const mn of mnList) {
            masternodes[mn.proTxHash] = mn;
        }
        state.masternodes = masternodes;
    }
};

const actions = {
    updateMasternode({commit, rootGetters}, mn: MasternodeEvent) {
        commit('updateMasternode', mn);
    },
    updateMasternodeList({commit, rootGetters}, mnList: Array<MasternodeEvent>) {
        commit('updateMasternodeList', mnList);
    },
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from firod
    masternodes: (state) => state.masternodes,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
