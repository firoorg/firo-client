const zmq = require('zeromq')
const config = require("./config")

const subscriber = zmq.socket('sub')
subscriber.connect('tcp://127.0.0.1:' + config.sub)

subscriber.subscribe('block')

subscriber.on('message', (topic, message) => {
    console.log('received message from publisher')
    console.log('topic', topic.toString())
    console.log('message', message ? JSON.stringify(JSON.parse(message.toString()), null, 4) : message)
})
