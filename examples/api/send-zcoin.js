const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:5557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    collection: 'send-zcoin',
    data: {
        addresses: {
            {
                address: 3.5,
                address: 10                
            }
        },
        feeperkb: 0.001
    }
}))
