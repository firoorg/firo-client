// background.js
import { ipcMain } from 'electron'

import Vue from 'vue'
import Vuex from 'vuex'

import AddressBook from "store/modules/AddressBook";
import AddressValidation from "store/modules/AddressValidation";
import ApiStatus from "store/modules/ApiStatus";
import App from "store/modules/App";
import Balance from "store/modules/Balance";
import Blockchain from "store/modules/Blockchain";
import Masternode from "store/modules/Masternode";
import Notification from "store/modules/Notification";
import PaymentRequest from "store/modules/PaymentRequest";
import Settings from "store/modules/Settings";
import Transactions from "store/modules/Transactions";
import Window from "store/modules/Window";

import { createLogger } from 'lib/logger'

const logger = createLogger('firo:store:main')

Vue.use(Vuex)

const clients = []

const store = new Vuex.Store({
    modules: {
        AddressBook,
        AddressValidation,
        ApiStatus,
        App,
        Balance,
        Blockchain,
        Masternode,
        Notification,
        PaymentRequest,
        Settings,
        Transactions,
        Window
    }
})

store.subscribe((mutation, state) => {
    Object.keys(clients).forEach((id) => {
        clients[id].send('vuex-apply-mutation', mutation)
    })
})

ipcMain.on('vuex-connect', (event) => {
    const win = event.sender
    let winId = win.id
    logger.info('[background] vuex connected', winId)

    win.on('destroyed', () => {
        clients[winId] = null
        delete clients[winId]
    })

    clients[winId] = event.sender
    event.returnValue = store.state
})

ipcMain.on('vuex-mutation', (event, args) => {
    try {
        const {type, payload} = args
        store.commit(type, payload)
    } catch (error) {
        logger.warn('error during vuex-mutation')
        logger.error(error)
        logger.debug("%O", args)
        event.sender.send('vuex-error', error)
    }
})

ipcMain.on('vuex-action', (event, args) => {
    try {
        const {content, payload} = args
        logger.debug('vuex-action: %o\npayload: %o', content, payload)
        store.dispatch(...args)
    } catch (error) {
        logger.warn('error during vuex-action')
        logger.error(error)
        logger.debug("%O", args)
        event.sender.send('vuex-error', error)
    }
})

export default store
