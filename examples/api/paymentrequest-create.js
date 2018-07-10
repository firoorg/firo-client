const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:25557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    type: 'create',
    collection: 'payment-request',
    data: {
        amount: 4,
        label: 'label',
        message: 'message'
    }
}))
