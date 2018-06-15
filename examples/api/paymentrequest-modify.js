const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:15557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    type: 'update',
    collection: 'payment-request',
    id: 'address-here',
    data: {
        label: 'this is a modified payment request label',
        isRecurring: true
    }
}))
