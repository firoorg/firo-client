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
    immature: 0,
    unspentMints: {}
}

const mutations = {
    updateBalance(state, balance) {
        logger.info("balance: %O", balance);
        state.availablePublic = balance.public.confirmed;
        state.unconfirmedPublic = balance.public.unconfirmed;

        state.immature = balance.public.immature;
        state.locked = balance.public.locked;

        state.availablePrivate = balance.private.confirmed;
        state.unconfirmedPrivate = balance.private.unconfirmed;
    }
}

const getters = {
    available: (state) => state.availablePrivate,
    unconfirmedPrivate: (state) => state.unconfirmedPrivate,
    availablePublic: (state) => state.availablePublic,
    unconfirmedPublic: (state) => state.unconfirmedPublic,
    pending: (state) => state.unconfirmedPrivate + state.unconfirmedPublic,
    locked: (state) => state.locked,
    immature: (state) => state.immature
}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
