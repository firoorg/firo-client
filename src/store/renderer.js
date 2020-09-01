import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

import modules from 'store/modules'
import types from 'store/types'

Vue.use(Vuex)

const localModules = [
    // todo reduce modules here by looking for local: true in the module definition
    // Object.keys(modules).map((name) => { modules[name].local ? name : )
    'AppRouter',
    'Router'
]

const store = new Vuex.Store({
    modules,
    strict: process.env.NODE_ENV !== 'production' // this up to you
})

//if (process.env.NODE_ENV !== 'production') {
window.vuexStore = store
window.vuexTypes = types

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
