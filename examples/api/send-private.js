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
    type: 'send-private',
    payload: {
        denominations: [
            {
                denomination: 25,
                amount: 160
            },
            {
                denomination: 10,
                amount: 10
            }
        ],
        address: 'third-party-address-to-spend-to-or-empty-to-spend-to-myself',
        label: 'label which belongs to the spend tx'
    }
}))
