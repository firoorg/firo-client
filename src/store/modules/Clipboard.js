import { isZcoinAddress } from '#/lib/zcoin'

const state = {
    clipboard: '',
    address: null
}

const mutations = {
    setClipboard (state, clipboardText) {
        state.clipboard = clipboardText

        // FIXME: This is locked to regtest/testnet.
        if (isZcoinAddress(clipboardText, {pubkeyAddress: 65, scriptAddresses: 178})) {
            state.address = clipboardText
        } else {
            state.address = null
        }
    }
}

const getters = {
    address: (state) => state.address,
    clipboard: (state) => state.clipboard
}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
