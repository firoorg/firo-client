import fs from 'fs'
import { join } from 'path'

// import types from '../../../store/types'
import CONFIG from '../../config'
import Debug from 'debug'
import * as utils from '../../../lib/utils'

// todo load modules dynamically
// import blockchain from './blockchain'
import { getApiStatus } from './ApiStatus'

import Address from './Address'
import PaymentRequest from './PaymentRequest'
import SendZcoin from './SendZcoin'
import Mint from './Mint'

const modules = {
    Address,
    PaymentRequest,
    SendZcoin,
    Mint
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
        debug('getting api status')

        const appConfig = CONFIG.network[CONFIG.network.currentNetwork] || {}

        const apiStatus = await getApiStatus({
            ...appConfig,
            dispatch,
            commit
        })

        this.setDataDirectory(apiStatus)
        const encryption = apiStatus.auth ? this.setupEncryption(apiStatus) : null

        Object.keys(modules).forEach((moduleName) => {
            const config = {
                ...appConfig,
                ...(CONFIG.network[moduleName] || {})
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
                commit,
                encryption
            })

            // console.log(module)
        })
    },

    setupEncryption (apiStatus) {
        const { datadir } = apiStatus
        const { root, client, server, fileName } = CONFIG.app.folders.encryption

        let certificates = {}

        for (let endpoint of [client, server]) {
            const keysPath = join(datadir, root, endpoint, fileName)
            const endpoindCertificates = JSON.parse(fs.readFileSync(keysPath).toString())

            certificates = {
                ...certificates,
                [endpoint]: endpoindCertificates.data
            }
        }

        return certificates
    },

    setDataDirectory (apiStatus) {
        const { datadir: location } = apiStatus

        dispatch(types.settings.SET_BLOCKCHAIN_LOCATION, { location: location })
    },

    setNetworkType (apiStatus) {

    },

    close () {
        console.log('closing network')
        Object.keys(modules).forEach((module) => {
            modules[module].close()
        })
    }
}
