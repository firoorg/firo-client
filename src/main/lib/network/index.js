import fs from 'fs'
import { join } from 'path'

import Debug from 'debug'

import CONFIG from '../../config'
import types from '~/types'
import * as utils from '../../../lib/utils'

// todo load modules dynamically
// import blockchain from './blockchain'
import { getApiStatus, closeApiStatus, waitForApi, populateStore } from './ApiStatus'


import App from './App'
import Address from './Address'
import Backup from './Backup'
import Balance from './Balance'
import Blockchain from './Blockchain'
import PaymentRequest from './PaymentRequest'
import SendZcoin from './SendZcoin'
import SpendZerocoin from './SpendZerocoin'
import Mint from './Mint'
import Znode from './Znode'

const modules = {
    App,
    Address,
    Backup,
    Balance,
    Blockchain,
    PaymentRequest,
    SendZcoin,
    SpendZerocoin,
    Mint,
    Znode
}

const debug = Debug('zcoin:network')

// const networkIdentity = uuid()
// let client = null
let store = null
let connectedToStore = false

const dispatch = (key, v) => {
    if (!store) {
        console.log(key, v)
        debug(key, v)
        return
    }

    store.dispatch(key, v)
}

const commit = (key, v) => {
    if (!store) {
        console.log(key, v)
        debug(key, v)
        return
    }

    store.commit(key, v)
}

const callBoundModuleMethod = (list, actionOrMutation, module) => {
    if (!list) {
        return
    }

    const { action, payload, type } = actionOrMutation

    if (list[type]) {
        module[list[type]](payload)
    } else if (list[action]) {
        module[list[action]](payload)
    }
}

export default {

    async init ({ store: vuexStore, /* namespace, */ moduleNames }) {
        store = vuexStore
        this.connectToStore()
        // todo whitelist modules via moduleNames
        debug('connected')

        debug('getting api status')

        const { host, port } = CONFIG.network.status

        let appConfig = null
        let encryption = null

        try {
            const apiStatus = await getApiStatus({
                host,
                port
            })

            const {network: NETWORK} = apiStatus.data
            appConfig = CONFIG.network.networks[NETWORK] || {}

            debug('got api status', apiStatus)

            populateStore({apiStatus, dispatch})

            encryption = apiStatus.data && apiStatus.data.devAuth ? this.setupEncryption(apiStatus.data.dataDir) : null

            const warmedUpApiStatus = await waitForApi({
                host,
                port,
                apiStatus,
                ttlInSeconds: CONFIG.network.secondsToWaitForApiToGetReady
            })

            // update store with warmed up values
            populateStore({apiStatus: warmedUpApiStatus, dispatch})
            store.dispatch(types.network.NETWORK_IS_CONNECTED)
            store.dispatch(types.app.IS_READY)
        } catch (e) {
            debug('Core API module not loaded after XX seconds.', e)
            // todo consider error throw here and shod message to the user. -> should try to restart...
            dispatch(types.network.SET_NETWORK_CONNECTION_ERROR, 1)
            return
        }

        try {
            debug('api loaded! setting up modules...', encryption)
            this.setupNetworkModules({appConfig, encryption})
        } catch (e) {
            console.log('------------------------------------------')
            console.log(e)
            console.log('------------------------------------------')
        }
    },

    setupNetworkModules ({ appConfig, encryption }) {
        Object.keys(modules).forEach((moduleName) => {
            const config = {
                ...appConfig,
                ...(CONFIG.network[moduleName] || {})
            }

            const module = modules[moduleName]
            const { namespace, actions, mutations } = module

            // todo check if multiple listeners will be bound on hot reload / daemon restart
            if (!connectedToStore) {
                debug('connecting network to store')
                utils.connectToStore({
                    store,
                    namespace,
                    // actions are coming from the network
                    onStoreAction: (action) => {
                        callBoundModuleMethod(actions, action, module)
                    },
                    // mutations to the store are done by the user/gui
                    onStoreMutation: (mutation) => {
                        callBoundModuleMethod(mutations, mutation, module)
                    }
                })
            }

            module.init({
                ...config,
                dispatch,
                commit,
                encryption
            })

            // console.log(module)
        })

        connectedToStore = true
    },

    setupEncryption (dataDir) {
        const { root, client, server, fileName } = CONFIG.app.folders.encryption

        let certificates = {}

        for (let endpoint of [client, server]) {
            const keysPath = join(dataDir, root, endpoint, fileName)
            const endpoindCertificates = JSON.parse(fs.readFileSync(keysPath).toString())

            certificates = {
                ...certificates,
                [endpoint]: endpoindCertificates.data
            }
        }

        return certificates
    },

    disconnect () {
        console.log('disconnecting from network')
        if (!modules || !Object.keys(modules).length) {
            return
        }

        Object.keys(modules).forEach((module) => {
            modules[module].disconnect()
        })
    },

    close () {
        console.log('closing network')
        closeApiStatus()

        if (!modules || !Object.keys(modules).length) {
            return
        }

        Object.keys(modules).forEach((module) => {
            modules[module].close()
        })
    },

    connectToStore () {
        if (connectedToStore) {
            return
        }

        utils.connectToStore({
            store,
            namespace: 'App',
            // mutations to the store are done by the user/gui
            onStoreMutation: async (mutation) => {
                const { type } = mutation

                if (type === types.app.DAEMON_STOPPED) {
                    this.close()
                }
            }
        })
    }
}
