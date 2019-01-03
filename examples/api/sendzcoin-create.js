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
    collection: 'sendZcoin',
    auth: {
        passphrase: config.passphrase
    },
    data: {
        addresses: {
            "TF1UcaHazfyoPVGDh9da1sSPd4KjJFVyg9": {
                amount: 300000000,
                label: "label"
            }, 
            "TRaTS9Q9QyYScxS6tiRdqNh76bw1FmTNKo": {
                amount: 200000000,
                label: "label"
            }
        },
        feePerKb: 100000
    }
}))
