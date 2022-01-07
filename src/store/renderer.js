import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

import AddressBook from "store/modules/AddressBook";
import ApiStatus from "store/modules/ApiStatus";
import App from "store/modules/App";
import Balance from "store/modules/Balance";
import Blockchain from "store/modules/Blockchain";
import CoinSwap from "store/modules/CoinSwap";
import Elysium from "store/modules/Elysium";
import Masternode from "store/modules/Masternode";
import Settings from "store/modules/Settings";
import Transactions from "store/modules/Transactions";

Vue.use(Vuex)

const localModules = [
    'AppRouter',
    'Router'
]

const store = new Vuex.Store({
    modules: {
        AddressBook,
        ApiStatus,
        App,
        Balance,
        Blockchain,
        CoinSwap,
        Elysium,
        Masternode,
        Settings,
        Transactions,
    },
    strict: false
})

//if (process.env.NODE_ENV !== 'production') {
window.vuexStore = store

// import master state
try {
    store.replaceState({...store.state, ...ipcRenderer.sendSync('vuex-connect')})
} catch (error) {
    console.error('import master state failed: %s', error)
}

const { commit } = store

store.commit = (...args) => {
    const [type, payload] = args

    const indexOfSlash = type.indexOf('/')
    const namespace = (~indexOfSlash) ? type.substr(0, indexOfSlash) : type

    if (localModules.includes(namespace)) {
        commit(type, payload)
    } else {
        ipcRenderer.send('vuex-mutation', {type, payload})
    }
}

ipcRenderer.on('vuex-apply-mutation', (event, { type, payload }) => {
    commit(type, payload)
})

ipcRenderer.on('vuex-error', (event, error) => console.error(error))

export default store
