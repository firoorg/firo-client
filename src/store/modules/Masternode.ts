import {cloneDeep} from 'lodash';
import {MasternodeEvent} from '../../daemon/zcoind';

import { createLogger } from '../../lib/logger'
const logger = createLogger('zcoin:store:Masternode');

const state = {
    masternodes: <{[proTxHash: string]: MasternodeEvent}>{},
};

const mutations = {
    updateMasternode(state, mn: MasternodeEvent) {
        state.masternodes[mn.proTxHash] = mn;
        state.masternodes = {...state.masternodes};
    },
    updateMasternodeList(state, mnList: Array<MasternodeEvent>) {
        mnList.forEach(e => {
            state.masternodes[e.proTxHash] = e;
        })
        state.masternodes = {...state.masternodes};
    }
};

const actions = {
    updateMasternode({commit, rootGetters}, mn: MasternodeEvent) {
        logger.info('updateMasternode:', mn);
        commit('updateMasternode', mn);
    },
    updateMasternodeList({commit, rootGetters}, mnList: Array<MasternodeEvent>) {
        commit('updateMasternodeList', mnList);
    },
};

const getters = {
    // a map of `${txid}-${txIndex}` to the full transaction object returned from zcoind
    masternodes: (state) => state.masternodes,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};