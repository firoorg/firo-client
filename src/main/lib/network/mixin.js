import Debug from 'debug'
import zmq from 'zeromq'
import types from '../../../store/types'

const debug = Debug('zcoin:network:mixin')

// @see http://zguide.zeromq.org/php:chapter5#Getting-an-Out-of-Band-Snapshot
export default {
    namespace: '',
    namespaceTypes: null,

    mutations: {
    },

    collection: '',
    subscriptions: [],

    subscriber: null, // zmq.socket('sub')
    requester: null, // zmq.socket('req')
    dispatchAction: null,
    commitMutation: null,

    init ({ host, ports, dispatch, commit, encryption }) {
        debug(`connecting to requester at ${ports.request}`)

        this.requester = zmq.socket('req')
        this.subscriber = zmq.socket('sub')

        if (encryption) {
            this.requester.curve_serverkey = encryption.server.public
            this.requester.curve_publickey = encryption.client.public
            this.requester.curve_secretkey = encryption.client.private
        } else if (process.env.NODE_ENV !== 'development') {
            throw new Error('no encryption provided.')
        }

        this.requester.connect(`${host}:${ports.request}`)

        this.dispatchAction = dispatch
        this.commitMutation = commit

        this.types = types[this.namespace.toLowerCase()]

        if (this.subscriptions && this.subscriptions.length) {
            debug(`connecting to publisher at ${ports.publisher}`)
            this.subscriber.connect(`${host}:${ports.publisher}`)

            this.setupSubscribers()
        }

        this.requestInitialState()
    },

    setupSubscribers () {
        this.subscriber.on('message', (topic, message) => {
            console.log(topic, message)
            if (topic) {
                console.log('topic', topic.toString())
            }

            if (message) {
                console.log('message', message.toString())
            }
            // debug('received a message from publisher related to:', topic.toString(), 'containing message:', message.toString())
            // todo parse message, unwrap json structure
            // todo standardise vuex type
        })

        for (let subscription of this.subscriptions) {
            debug('subscribing to', subscription)
            this.subscriber.subscribe(subscription)
        }
    },

    requestInitialState () {
        if (!this.types.SET_INITIAL_STATE) {
            debug('no initial state action set for', this.collection)
            return
        }

        this.requester.once('message', (message) => {
            try {
                const response = JSON.parse(message.toString())
                console.log('this.types', this.types)
                this.processResponse(response, this.types.SET_INITIAL_STATE)
            } catch (e) {
                console.log('error in response of initial request call.', this.namespace)
                console.log(e)
                console.log(message.toString())
            }
        })

        // todo add timeout to request
        debug('sending initial state request', this.collection)
        this.requester.send(JSON.stringify({
            type: 'initial',
            collection: this.collection
        }))
    },

    processResponse (response, actionToDispatch) {
        // console.log('received message from the network', response)
        if (this.types.IS_LOADING) {
            this.commitMutation(this.types.IS_LOADING, false)
        }

        const { meta, data } = response

        if (!meta || meta.status < 200 || meta.status >= 400) {
            console.warn(response)
            // todo send error response back
            return
        }

        if (!data) {
            debug('nothing received. returning...')
            return
        }

        debug('dispatching action', actionToDispatch)

        if (actionToDispatch) {
            this.dispatchAction(actionToDispatch, data)
        }
    },

    send ({ type, collection, data, actionToDispatch }) {
        const onMessage = (message) => {
            const response = JSON.parse(message.toString())

            console.log('response', response)
            this.processResponse(response, actionToDispatch)
        }

        this.requester.once('message', onMessage)

        console.log('sending data --> ', data)

        this.requester.send(JSON.stringify({
            collection: collection || this.collection,
            type,
            data
        }))
    },

    close () {
        try {
            this.subscriber.close()
        } catch (e) {
            console.log(e.type)
            // console.log(e)
        }

        try {
            this.requester.close()
        } catch (e) {
            // console.log(e)
        }
    }
}
