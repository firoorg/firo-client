import { createLogger } from '../../lib/logger';
const logger = createLogger('zcoin:store:PaymentRequest');

interface PaymentRequest {
    amount: number | undefined;
    label: string;
    message: string;
    address: string;
    createdAt: number;
    state: 'active' | 'hidden' | 'deleted' | 'archived'
}

const state = {
    paymentRequests: <{[address: string]: PaymentRequest}>{}
};

const mutations = {
    setStateWithInitialPaymentRequest(state, initialPaymentRequestState: {[address: string]: PaymentRequest}) {
        logger.info("Populating initial paymentRequest state...");
        state.paymentRequests = initialPaymentRequestState;
    }
};

const actions = {
    setStateWithInitialPaymentRequest({commit}, initialPaymentRequestState: {[address: string]: PaymentRequest}) {
        commit('setStateWithInitialPaymentRequest', initialPaymentRequestState);
    }
};

const getters = {
    paymentRequests: (state) => state.paymentRequests
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};