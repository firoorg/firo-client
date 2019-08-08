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
    },

    addOrUpdatePaymentRequestFromResponse(state, paymentRequest: PaymentRequest) {
        logger.info("Updating payment request %s", paymentRequest.address);

        // FIXME: Change to use Vue.set once issues with WebPack require aliases are resolved.
        state.paymentRequests = {
            ...state.paymentRequests,
            [paymentRequest.address]: paymentRequest
        };
    }
};

const actions = {
    setStateWithInitialPaymentRequest({commit}, initialPaymentRequestState: {[address: string]: PaymentRequest}) {
        commit('setStateWithInitialPaymentRequest', initialPaymentRequestState);
    },

    addOrUpdatePaymentRequestFromResponse({commit}, paymentRequest: PaymentRequest) {
        commit('addOrUpdatePaymentRequestFromResponse', paymentRequest);
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