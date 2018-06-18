// import ElectrumCli from 'electrum-client'
// import types from '../../../store/types'
import NETWORK_CONFIG from '../../config/network'
import Debug from 'debug'
import * as utils from '../../../lib/utils'

// import uuid from 'uuid/v4'

// todo load modules dynamically
// import blockchain from './blockchain'
import paymentRequest from './PaymentRequest'

const modules = {
    // blockchain
    paymentRequest
}

const debug = Debug('zcoin:network')

// const networkIdentity = uuid()
// let client = null
let store = null

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
    let fn = null

    console.log(list, type)

    if (list[type]) {
        fn = module[list[type]]
    } else if (list[action]) {
        fn = module[list[action]]
    }

    if (fn) {
        fn(payload)
    }
}

const MAIN_OR_TEST = 'testnet'

export default {

    async init ({ store: vuexStore, /* namespace, */ moduleNames }) {
        store = vuexStore

        // todo whitelist modules via moduleNames

        debug('connected')
        Object.keys(modules).forEach((moduleName) => {
            const appConfig = NETWORK_CONFIG[MAIN_OR_TEST] || {}
            const config = {
                ...appConfig,
                ...(NETWORK_CONFIG[moduleName] || {})
            }

            const module = modules[moduleName]
            const { namespace, actions, mutations } = module

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

            module.init({
                ...config,
                dispatch,
                commit
                // identity: networkIdentity
            })
        })
    },

    onStoreAction ({ action, payload, type, namespace }) {
        console.log('network received action', action, payload, type, namespace)
    },

    close: async () => {
        console.log('closing network')
        Object.keys(modules).forEach((module) => {
            modules[module].close()
        })
    // await client.close() // disconnect(promise)
    }
}
