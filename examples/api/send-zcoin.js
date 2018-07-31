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
    type: 'create',
    collection: 'sendzcoin',
	auth: {
	    passphrase: config.passphrase
	},
    data: {
        addresses: {
            "TZ14Q3J7DYx4wmT8HAAeKY9mtsBo1MjHc5": 100000000,
            "TZ7r4GUyGQ4p5sf8GCGgE4X2BLSTjqpyfS": 100000000                
        },
        feeperkb: 100000
    }
}))
