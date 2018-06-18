import Debug from 'debug'
import zmq from 'zeromq'
import types from '../../../store/types'

const debug = Debug('zcoin:network:api')

const subscriber = zmq.socket('sub')
const requester = zmq.socket('req')

// @see http://zguide.zeromq.org/php:chapter5#Getting-an-Out-of-Band-Snapshot
let dispatchAction = null
let commitMutation = null

export default {
    namespace: 'PaymentRequest',
    mutations: {
        [types.paymentrequest.CREATE_PAYMENT_REQUEST]: 'createPaymentRequest'
    },
    init ({ host, ports, dispatch, commit, identity, topic }) {
        // subscriber.identity = identity
        // requester.identity = identity

        // debug(`connecting to ${ports.publisher}`)
        // subscriber.connect(`${host}:${ports.publisher}`)

        console.log(`connecting to ${ports.request}`)
        requester.connect(`${host}:${ports.request}`)

        // sets up the subscription pattern
        // debug(`subscribing to "${topic}"`)
        // subscriber.subscribe(topic)
        // debug(`Subscriber connected to port ${ports.publisher}`)

        this.setupListeners(dispatch)
        dispatchAction = dispatch
        commitMutation = commit

        console.log(typeof dispatchAction, typeof commitMutation)
    },

    setupListeners (dispatch) {
        subscriber.on('message', (topic, message) => {
            debug('received a message from publisher related to:', topic.toString(), 'containing message:', message.toString())
            // todo parse message, unwrap json structure
            // todo standardise vuex type
        })
    },

    requestInitialState () {
        requester.on('message', (type, value) => {
            debug('got message from broker:', type.toString(), value.toString())
        })
        requester.send(['api', 'REQUEST_CURRENT_STATE'])
    },

    createPaymentRequest ({ label, message, amount }) {
        console.log('CREATING PAYMENT REQUEST')

        requester.on('message', function (msg) {
            const response = JSON.parse(msg.toString())

            console.log(response)
            const { meta } = response

            if (meta.status !== 200) {
                console.warn(response)
                // todo send error response back
                dispatchAction(types.paymentrequest.CREATING_PAYMENT_REQUEST, false)
                return
            }

            const paymentRequest = {
                label,
                message,
                amount,
                address: response.data
            }

            console.log(types)

            console.log('Created Payment Request', paymentRequest)
            dispatchAction(types.paymentrequest.ADD_PAYMENT_REQUEST, paymentRequest)
        })

        console.log('sending payment request')
        requester.send(JSON.stringify({
            type: 'create',
            collection: 'payment-request',
            data: {
                label,
                amount,
                message
            }
        }))
    },

    close () {
        try {
            subscriber.close()
        } catch (e) {
            console.log(e.type)
            // console.log(e)
        }

        try {
            requester.close()
        } catch (e) {
            // console.log(e)
        }
    }
}
