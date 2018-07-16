const config = require("./config")
const zmq = require('zeromq');

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:' + config.testnet + config.auth)

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    type: 'create',
    collection: 'mint',
    data: {
        denominations: {
            "25" : 4,
            "10": 4,
            "1": 9
        }
    }
}))
