import {fromPairs} from "lodash";
import {AddressBookItem} from "../../daemon/firod"
import Vue from "vue";

const state = {
    addressBook: <{[address: string]: AddressBookItem}>{}
};

const mutations = {
    setAddressBook(state, addressBook: AddressBookItem[]) {
        state.addressBook = fromPairs(addressBook.map(x => [x.address, x]));
    },

    // This must be called *in addition to* $daemon.editAddressBook.
    updateAddress(state, addressBookItem: AddressBookItem) {
        Vue.set(state.addressBook, addressBookItem.address, addressBookItem);
    },

    deleteAddress(state, addressBookItem: AddressBookItem) {
        delete state.addressBook[addressBookItem.address];
    }
};

const getters = {
    addressBook: (state) => state.addressBook,

    sendAddresses: (state) =>
        (<AddressBookItem[]>Object.values(state.addressBook))
            .filter(a => a.purpose === 'send')
            .sort((a, b) => b.createdAt - a.createdAt),

    receiveAddresses: (state) =>
        (<AddressBookItem[]>Object.values(state.addressBook))
            .filter(a => a.purpose === 'receive')
            .sort((a, b) => b.createdAt - a.createdAt),

    rapReceiveAddresses: (state) =>
        (<AddressBookItem[]>Object.values(state.addressBook))
            .filter(a => a.purpose === 'rap-receive')
            .sort((a, b) => a.label.localeCompare(b.label)),
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
}