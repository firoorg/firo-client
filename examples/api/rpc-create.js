const config = require("./config")
const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:' + (TESTNET ? config.testnet : config.regtest) + config.auth)

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    var loadPath = JSON.parse(JSON.stringify(msg.toString(),null, 2))
    console.log(loadPath)
})

// send stringified json
requester.send(JSON.stringify({
    type: 'create',
    collection: 'rpc',
    data: {
        method: "listtransactions",
        args: "\"*\" 100 0",
    },
    auth: {
        passphrase: config.passphrase
    },
}))
