import zmq from 'zeromq'
import { isString, isFunction } from 'lodash'
import { createLogger } from '#/lib/logger'

import types from '~/types'

const logger = createLogger('zcoin:network:mixin')

// @see http://zguide.zeromq.org/php:chapter5#Getting-an-Out-of-Band-Snapshot
export default {
    namespace: '',
    namespaceTypes: null,

    mutations: {
    },

    initialRequestType: 'initial',
    collection: '',
    subscriptions: [],

    subscriberUri: '',
    subscriber: null, // zmq.socket('sub')

    requesterUri: '',
    requester: null, // zmq.socket('req')

    dispatchAction: null,
    commitMutation: null,

    init ({ host, ports, dispatch, commit, encryption }) {
        logger.info(`connecting to requester at ${ports.request}`)

        this.requester = zmq.socket('req')

        // set timeout for requester socket
        this.requester.setsockopt(zmq.ZMQ_RCVTIMEO, 2000)
        this.requester.setsockopt(zmq.ZMQ_SNDTIMEO, 2000)

        this.subscriber = zmq.socket('sub')

        if (encryption) {
            this.requester.curve_serverkey = encryption.server.public
            this.requester.curve_publickey = encryption.client.public
            this.requester.curve_secretkey = encryption.client.private

            this.subscriber.curve_serverkey = encryption.server.public
            this.subscriber.curve_publickey = encryption.client.public
            this.subscriber.curve_secretkey = encryption.client.private
        } else if (process.env.NODE_ENV !== 'development') {
            // todo limit error to mainnet?
            dispatch(types.network.SET_NETWORK_CONNECTION_ERROR, 2)
            logger.error('no encryption provided')
            throw new Error('no encryption provided.')
        }

        this.requesterUri = `${host}:${ports.request}`
        this.requester.connect(this.requesterUri)

        this.dispatchAction = dispatch
        this.commitMutation = commit

        this.types = types[this.namespace.toLowerCase()]

        if (this.subscriptions && this.subscriptions.length) {
            logger.info(`connecting to publisher at ${ports.publisher}`)
            this.subscriberUri = `${host}:${ports.publisher}`
            this.subscriber.connect(this.subscriberUri)

            this.setupSubscribers()
        }

        this.requestInitialState()
    },

    setupSubscribers () {
        this.subscriber.on('message', (topicBuffer, messageBuffer) => {
            const topic = topicBuffer ? topicBuffer.toString() : null
            const message = messageBuffer ? messageBuffer.toString() : null

            try {
                // console.log('processing response -> ', `ON_${topic.toUpperCase()}_SUBSCRIPTION`)

                const json = JSON.parse(message)
                const { data } = json

                this.dispatchAction(this.types[`ON_${topic.toUpperCase()}_SUBSCRIPTION`], data)
            } catch (e) {
                logger.warn('error in response of', topic, 'request', this.subscriptions)
                logger.error(e)
                logger.warn(message)
            }
        })

        for (let subscription of this.subscriptions) {
            logger.info('subscribing to', subscription)
            this.subscriber.subscribe(subscription)
        }
    },

    requestInitialState () {
        if (!this.collection) {
            return
        }

        if (!this.types.SET_INITIAL_STATE) {
            logger.debug('no initial state action set for', this.collection)
            return
        }

        this.requester.once('message', (message) => {
            logger.info('received initial state request', this.collection)

            try {
                const response = JSON.parse(message.toString())

                this.processResponse(response, {
                    onSuccess: this.types.SET_INITIAL_STATE
                })
                // todo set intial loading true
                // this.setLoading(false)
            } catch (e) {
                logger.info('error in response of %s initial request call.', this.namespace)
                logger.error(e)
                logger.warn(message.toString())
            }
        })

        // todo add timeout to request
        logger.info('sending initial state request for %s', this.collection)
        this.requester.send(JSON.stringify({
            type: this.initialRequestType,
            collection: this.collection
        }))
    },

    setLoading (val) {
        if (this.types.IS_LOADING) {
            this.commitMutation(this.types.IS_LOADING, val)
        }
    },

    processResponse (response, { onSuccess, onError }) {
        // console.log('received message from the network', response)
        const { meta, data, error } = response

        // todo subscriptions are pushed to the client and therefore dont have a meta key set.
        if (!meta || meta.status < 200 || meta.status >= 400) {
            logger.warn(response)
            if (onError) {
                if (isString(onError)) {
                    logger.info('dispatching action', onError)
                    this.dispatchAction(onError, { _meta: meta, error })
                } else if (isFunction(onError)) {
                    logger.info('invoking onError callback')
                    onError({ _meta: meta, error })
                }
            }
            return
        }

        if (!data) {
            logger.info('nothing received. returning...')
            return
        }

        if (onSuccess) {
            if (isString(onSuccess)) {
                logger.info('dispatching action', onSuccess)
                this.dispatchAction(onSuccess, { _meta: meta, ...data })
            } else if (isFunction(onSuccess)) {
                logger.info('invoking onSuccess callback')
                onSuccess({ _meta: meta, ...data })
            }
        }
    },

    send ({ type, collection, data, auth = null }, actionsToDispatch = {}) {
        if (!collection && !this.collection) {
            logger.warn('can not send. no collection given!', {
                type,
                data,
                actionsToDispatch
            })

            return
        }

        const onMessage = (message) => {
            const response = JSON.parse(message.toString())

            logger.debug('response', response)
            this.processResponse(response, actionsToDispatch)
            this.setLoading(false)
        }

        this.requester.once('message', onMessage)

        logger.info('sending data --> ', Date.now(), data)
        this.setLoading(true)

        this.requester.send(JSON.stringify({
            collection: collection || this.collection,
            type,
            data,
            auth
        }))
    },

    disconnect () {
        try {
            this.subscriber.disconnect(this.subscriberUri)
        } catch (e) {
            console.log(e.type)
            // console.log(e)
        }

        try {
            this.requester.disconnect(this.requesterUri)
        } catch (e) {
            // console.log(e)
        }
    },

    close () {
        try {
            this.subscriber.close()
        } catch (e) {
            logger.error(e.type)
            // console.log(e)
        }

        try {
            this.requester.close()
        } catch (e) {
            // console.log(e)
        }
    }
}
