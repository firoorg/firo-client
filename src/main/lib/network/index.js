import fs from 'fs'
import { join } from 'path'

import { createLogger } from '#/lib/logger'

import CONFIG from '../../config'
import types from '~/types'
import * as utils from '../../../lib/utils'

// todo load modules dynamically
// import blockchain from './blockchain'
import apiStatus from './ApiStatus'

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

const logger = createLogger('zcoin:network')

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

// const networkIdentity = uuid()
// let client = null
let store = null
let connectedToStore = false

const dispatch = (key, v) => {
    if (!store) {
        console.log(key, v)
        return
    }

    store.dispatch(key, v)
}

const commit = (key, v) => {
    if (!store) {
        console.log(key, v)
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
        logger.info('connected')

        logger.info('getting api status')

        const { host, ports } = CONFIG.network.status

        let appConfig = null
        let encryption = null

        try {
            apiStatus.init({
                host,
                ports
            })
            const status = await apiStatus.get()

            const {network: NETWORK} = status.data
            appConfig = CONFIG.network.networks[NETWORK] || {}

            logger.info('got api status %o', status)

            apiStatus.populateStore({
                status,
                dispatch
            })

            encryption = status.data && status.data.devAuth ? this.setupEncryption(status.data.dataDir) : null

            const warmedUpApiStatus = await apiStatus.wait({
                ttlInSeconds: CONFIG.network.secondsToWaitForApiToGetReady
            })

            // update store with warmed up values
            apiStatus.populateStore({
                status: warmedUpApiStatus,
                dispatch
            })

            store.dispatch(types.network.NETWORK_IS_CONNECTED)
            store.dispatch(types.app.IS_READY)
        } catch (e) {
            console.log(e)
            logger.error('Core API module not loaded after XX seconds.', e)
            // todo consider error throw here and shod message to the user. -> should try to restart...
            dispatch(types.network.SET_NETWORK_CONNECTION_ERROR, 1)
            return
        }

        try {
            logger.info('api loaded! setting up modules...', encryption)
            this.setupNetworkModules({appConfig, encryption})
        } catch (e) {
            logger.warn('error during api loading')
            console.error(e)
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
                logger.debug('connecting network to store')
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
        logger.info('disconnecting from network')
        if (!modules || !Object.keys(modules).length) {
            return
        }

        Object.keys(modules).forEach((module) => {
            modules[module].disconnect()
        })
    },

    close () {
        logger.info('closing network')
        apiStatus.close()

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
