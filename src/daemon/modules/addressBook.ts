import {Firod} from "../firod";

export async function initialize(store: any, firod: Firod) {
    const data = await firod.readAddressBook();
    store.commit('AddressBook/setAddressBook', data);
}
