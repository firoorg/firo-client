const config = require("./config")
const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:' + (TESTNET ? config.testnet : config.regtest) + config.auth)

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    type: 'delete',
    collection: 'paymentrequest',
	auth: {
	    passphrase: config.passphrase
	},
    data: {
        id: 'TJGCbD628dUBGt2NpTtEmkrBm67V5aee7D',
        label: 'this is a modified payment request label'
    }
}))
