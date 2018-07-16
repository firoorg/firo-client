const config = require("./config")
const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:' + config.testnet + config.auth)

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(JSON.parse(msg.toString()))
})

// send stringified json
requester.send(JSON.stringify({
    collection: 'send-private',
	auth: {
	    password: config.password
	},
    data: {
        denominations: [
            {
                address: "TLqow9uuHQkCj4b3tTAhXDTNQ2UxwFpnT9",
                denomination: 25,
                amount: 2
            },
            {
                address: "TLqow9uuHQkCj4b3tTAhXDTNQ2UxwFpnT9",
                denomination: 10,
                amount: 1
            }
        ],
        label: 'label which belongs to the spend tx'
    }
}))
