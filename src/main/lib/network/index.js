// import types from '../../../store/types'
import NETWORK_CONFIG from '../../config/network'
import Debug from 'debug'
import * as utils from '../../../lib/utils'

// todo load modules dynamically
// import blockchain from './blockchain'
import Address from './Address'
import PaymentRequest from './PaymentRequest'
import SendZcoin from './SendZcoin'

const modules = {
    Address,
    PaymentRequest,
    SendZcoin
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

    if (list[type]) {
        module[list[type]](payload)
    } else if (list[action]) {
        module[list[action]](payload)
    }
}

export default {

    async init ({ store: vuexStore, /* namespace, */ moduleNames }) {
        store = vuexStore

        // todo whitelist modules via moduleNames

        debug('connected')
        Object.keys(modules).forEach((moduleName) => {
            const appConfig = NETWORK_CONFIG[NETWORK_CONFIG.currentNetwork] || {}
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
            })

            // console.log(module)
        })
    },

    close () {
        console.log('closing network')
        Object.keys(modules).forEach((module) => {
            modules[module].close()
        })
    }
}
