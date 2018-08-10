const config = require("./config")
const zmq = require('zeromq')

const requester = zmq.socket('req')
requester.connect('tcp://127.0.0.1:15557')

// log out replies
requester.on('message', (msg) => {
    console.log('received message')
    console.log(msg.toString())
})

// send stringified json
requester.send(JSON.stringify({
    type: 'initial',
    collection: 'znodeList'
}))
