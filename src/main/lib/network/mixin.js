import zmq from 'zeromq'
import types from '../../../store/types'

// const debug = Debug('zcoin:network:api')

// @see http://zguide.zeromq.org/php:chapter5#Getting-an-Out-of-Band-Snapshot
export default {
    namespace: '',
    namespaceTypes: null,

    mutations: {
    },

    collection: '',

    subscriber: null, // zmq.socket('sub')
    requester: null, // zmq.socket('req')
    dispatchAction: null,
    commitMutation: null,

    init ({ host, ports, dispatch, commit, encryption }) {
        console.log(`connecting to ${ports.request}`)

        this.requester = zmq.socket('req')
        this.subscriber = zmq.socket('sub')

        if (!encryption) {
            throw new Error('encryption disabled.')
        }

        this.requester.curve_serverkey = encryption.server.public
        this.requester.curve_publickey = encryption.client.public
        this.requester.curve_secretkey = encryption.client.private

        this.requester.connect(`${host}:${ports.request}`)
        // this.subscriber.subscribe(this.collection)

        this.dispatchAction = dispatch
        this.commitMutation = commit

        this.types = types[this.namespace.toLowerCase()]

        // this.setupListeners()
        this.requestInitialState()
    },

    /*
    setupListeners (dispatch) {
        subscriber.on('message', (topic, message) => {
            debug('received a message from publisher related to:', topic.toString(), 'containing message:', message.toString())
            // todo parse message, unwrap json structure
            // todo standardise vuex type
        })
    },
    */

    requestInitialState () {
        if (!this.types.SET_INITIAL_STATE) {
            console.log('no initial state action set for', this.collection)
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
        console.log('sending initial state request', this.collection)
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
            console.log('nothing received. returning...')
            return
        }

        console.log('dispatching action', actionToDispatch)

        if (actionToDispatch) {
            this.dispatchAction(actionToDispatch, data)
        }
    },

    send ({ type, collection, data, actionToDispatch }) {
        const onMessage = (message) => {
            const response = JSON.parse(message.toString())

            // console.log('response', response)
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
