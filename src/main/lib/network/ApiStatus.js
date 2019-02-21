import zmq from 'zeromq'
import types from '~/types'
import EventEmitter from 'events'
import { has } from 'lodash'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:apiStatus')

export default {
    subscriber: null,
    currentStatus: null,
    emitter: null,

    init({ host, ports }) {
        console.log('------>', { host, ports })
        const subscriberUri = `${host}:${ports.publisher}`

        this.subscriber = zmq.socket('sub')
        this.emitter = new EventEmitter()

        this.subscriber.connect(subscriberUri)

        this.subscriber.subscribe('apiStatus')

        this.subscriber.on('message', (topic, msg) => {
            try {
                const { data, meta, error } = JSON.parse(msg.toString())

                if (error || (meta.status < 200 && meta.status >= 400)) {
                    //reject(new Error('error occured during api status fetching.', error))
                    return
                }

                this.currentStatus = { data, meta }
                this.emitter.emit('update', this.currentStatus)
            } catch (e) {
                logger.error(e)
                //reject(new Error('error occured during api status fetching.', e))
            }
        })
    },

    async get () {
        if (this.currentStatus) {
            return this.currentStatus
        }

        return new Promise((resolve, reject) => {
            this.emitter.once('update', (newStatus) => {
                resolve(newStatus)
            })
        })
    },

    async wait ({ apiStatus, ttlInSeconds }) {
        if (this.isValidCurrentStatus(this.currentStatus)) {
            return this.currentStatus
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`ApiStatus.wait timed out / TTL: ${ttlInSeconds}`))
            }, ttlInSeconds * 1000)

            const validateStatus = (newStatus) => {
                if (!this.isValidCurrentStatus(newStatus)) {
                    return
                }

                logger.debug('got valid status. removing listener, clearing timeout.')
                // remove listener
                this.emitter.off('update', validateStatus)
                // clear timeout
                clearTimeout(timeout)

                // return status
                resolve(newStatus)
            }

            this.emitter.on('update', validateStatus)
        })
    },

    validator ({ status, data }) {
        const { modules = {}, walletVersion } = data

        logger.debug('validating api status %d %o', status, data)

        return status === 200 && modules.API && walletVersion
    },

    isValidCurrentStatus (apiStatus) {
        if (!apiStatus) {
            return false
        }

        if (!has(apiStatus, 'data') || !has(apiStatus, 'meta')) {
            return false
        }

        const { data, meta } = apiStatus
        const { status } = meta

        return this.validator({ status, data })
    },

    populateStore ({ status, dispatch }) {
        const { data, meta } = status

        if (!meta || meta.status !== 200) {
            return
        }

        const { walletLock, walletVersion, dataDir: location } = data
        logger.info('populating store with api status %o', data)

        if (walletLock !== undefined && walletVersion !== undefined) {
            console.log('setting client locked state to', walletLock)
            dispatch(types.app.SET_WALLET_LOCKED, walletLock)
            dispatch(types.app.SET_WALLET_VERSION, walletVersion)
        }

        dispatch(types.app.SET_BLOCKCHAIN_LOCATION, location)
    },

    close () {
        this.currentStatus = null

        try {
            if (this.subscriber && !this.subscriber.closed) {
                this.subscriber.close()
            }
        }
        catch (e) {
            console.log(e)
        }
    }
}
