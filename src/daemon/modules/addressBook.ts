import {Firod} from "../firod";

export async function initialize(store: any, firod: Firod) {
    await firod.awaitApiResponse();
    await firod.awaitBlockchainLoaded();

    const data = await firod.readAddressBook();
    store.commit('AddressBook/setAddressBook', data);
}

export const name = 'addressBook';