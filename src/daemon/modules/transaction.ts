import { Zcoind } from '../zcoind';

export async function handleEvent(store, zcoin: Zcoind, eventData: any) {
    store.dispatch('Transactions/handleTransactionEvent', eventData);
    //update payment channel state
    const paymentChannelsState = await zcoin.readPaymentChannelsState();
    store.dispatch('Transactions/setPaymentChannels', Object.values(paymentChannelsState));

    if (Object.values(store.getters['Transactions/unusedAddresses']).length == 0) {
      var createds = [];
      try {
        var createdAddress = await zcoin.getUnusedAddress();
        createds.push({
          address: createdAddress,
          label: "",
          purpose: "receive",
        });
        console.log('created address:', createdAddress);
        await this.$store.dispatch("Transactions/setAddressBook", createds);
      } catch(e) {
        console.log('error:', e)
      }
    }
}