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
      collection: 'txFee',
			auth: {
			    passphrase: config.passphrase
			},
      data: {
          addresses: {
              TUAJcpmNqpg4gX4RC2ZuUN6eA34MYpgjNE: 1000000,
              TV3f8WhYuMyMLGJuwhdU7psvmCS63yuy3t: 1000000,
          },
          feeperkb: 200000
      }
}))
