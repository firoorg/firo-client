// background.js
import { ipcMain } from 'electron'

import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'

Vue.use(Vuex)

const clients = []

const store = new Vuex.Store({
    modules
})

store.subscribe((mutation, state) => {
    Object.keys(clients).forEach((id) => {
        clients[id].send('vuex-apply-mutation', mutation)
    })
})

ipcMain.on('vuex-connect', (event) => {
    const win = event.sender
    let winId = win.id
    console.log('[background] vuex-connect', winId)

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
        // console.log('vuex-mutation: %s\npayload: %o', type, payload)
        store.commit(type, payload)
    } catch (error) {
        console.error(error)
        console.log(args)
        event.sender.send('vuex-error', error)
    }
})

ipcMain.on('vuex-action', (event, args) => {
    try {
        const {content, payload} = args
        console.log('vuex-action: %o\npayload: %o', content, payload)
        store.dispatch(...args)
    } catch (error) {
        console.error(error)
        console.log(args)
        event.sender.send('vuex-error', error)
    }
})

export default store
