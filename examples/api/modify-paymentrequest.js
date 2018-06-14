const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:5557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
// user should be able to update message and title/label
requester.send(JSON.stringify({
    type: 'update',
    collection: 'payment-request',
    id: 'address-here',
    payload: {
        message: 'this is a modified payment request message'
    }
}))
