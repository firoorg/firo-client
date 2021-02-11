import { Firod } from '../firod';

export async function initialize(store: any, firod: Firod) {
    store.commit('PaymentRequest/setStateWithInitialPaymentRequest', await firod.send(null, 'initial', 'paymentRequest', {}));
}
