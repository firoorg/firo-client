const config = require("./config")
const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:' + config.testnet + config.auth)

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    var loadPath = JSON.parse(JSON.stringify(msg.toString(),null, 2))
    console.log(loadPath)
})

// send stringified json
requester.send(JSON.stringify({
    type: 'initial',
    collection: 'state-wallet',
    auth: {
        password: config.password
    }
}))
