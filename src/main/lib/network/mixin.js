import zmq from 'zeromq'
import types from '../../../store/types'

// const debug = Debug('zcoin:network:api')

// @see http://zguide.zeromq.org/php:chapter5#Getting-an-Out-of-Band-Snapshot
export default {
    namespace: 'PaymentRequest',

    mutations: {
        [types.paymentrequest.CREATE_PAYMENT_REQUEST]: 'createPaymentRequest'
    },

    collection: 'payment-request',

    subscriber: null, // zmq.socket('sub')
    requester: null, // zmq.socket('req')
    dispatchAction: null,
    commitMutation: null,

    init ({ host, ports, dispatch, commit }) {
        console.log(`connecting to ${ports.request}`)

        this.requester = zmq.socket('req')
        this.subscriber = zmq.socket('sub')

        this.requester.connect(`${host}:${ports.request}`)
        this.subscriber.subscribe(this.collection)

        this.dispatchAction = dispatch
        this.commitMutation = commit

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
        this.requester.once('message', (message) => {
            const response = JSON.parse(message.toString())
            // console.log('response', JSON.parse(response.toString()))
            this.processResponse(response, types[this.namespace.toLowerCase()].SET_INITIAL_STATE)
        })

        this.requester.send(JSON.stringify({
            type: 'initial',
            collection: this.collection
        }))
    },

    processResponse (response, actionToDispatch) {
        console.log('received message from the network', response)
        this.commitMutation(types.paymentrequest.IS_LOADING, false)

        const { meta, data } = response

        if (meta.status < 200 || meta.status >= 400) {
            console.warn(response)
            // todo send error response back
            return
        }

        console.log('dispatching action', actionToDispatch)

        this.dispatchAction(actionToDispatch, data)
    },

    send (type, data, actionToDispatch) {
        this.requester.once('message', (message) => {
            const response = JSON.parse(message.toString())

            this.processResponse(response, actionToDispatch)
        })

        this.requester.send(JSON.stringify({
            collection: this.collection,
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
