const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:5557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(msg)
})

// send stringified json
requester.send(JSON.stringify({
    type: 'getpaymentrequest',
    payload: [
        4000,
        'title',
        'message'
    ]
}))
