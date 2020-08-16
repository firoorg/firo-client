import { Zcoind } from '../zcoind';

export async function handleEvent(store, zcoin: Zcoind, eventData: any) {
    store.dispatch('Transactions/handleTransactionEvent', eventData);
    //update payment channel state
    const paymentChannelsState = await zcoin.readPaymentChannelsState();
    store.dispatch('Transactions/setPaymentChannels', Object.values(paymentChannelsState));
}