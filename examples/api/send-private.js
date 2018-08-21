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
    collection: 'sendPrivate',
    data: {
        address: "TUbC7KzQB1VyFzBv83p37VCEQiq2PUUAFy", // testnet external
        //address: "TYyAHT6BvRtz72opiZ9QrQRjAozJcX9HDx",   // testnet internal
        denomination: [
            {
                value: 1,
                amount: 1
            }
        ],
        label: 'label which belongs to the spend tx'
    },
    auth: {
        passphrase: config.passphrase
    },
}))
