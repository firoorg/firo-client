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
    type: 'mint',
    payload: {
        denominations: [
            {
                denomination: 25,
                amount: 4
            },
            {
                denomination: 10,
                amount: 4
            },
            {
                denomination: 1,
                amount: 9
            }
        ]
    }
}))
