const zmq = require('zeromq')
const config = require("./config")

const subscriber = zmq.socket('sub')
subscriber.connect('tcp://127.0.0.1:' + config.sub)

subscriber.subscribe('address')
subscriber.subscribe('block')

subscriber.on('message', (topic, message) => {
    console.log('received message from address publisher')
    console.log('topic', topic.toString())
    console.log('message', message ? JSON.parse(message.toString()) : message)
})

subscriber.on('message', (topic, message) => {
    console.log('received message from block publisher')
    console.log('topic', topic.toString())
    console.log('message', message ? JSON.parse(message.toString()) : message)
})