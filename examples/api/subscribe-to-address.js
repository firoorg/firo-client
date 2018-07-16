const zmq = require('zeromq')

const subscriber = zmq.socket('sub')
subscriber.connect('tcp://127.0.0.1:28332')

subscriber.subscribe('address')
subscriber.subscribe('block')

subscriber.on('message', (topic, message) => {
    console.log('received message from publisher')
    console.log('topic', topic.toString())
    console.log('message', message ? JSON.stringify(JSON.parse(message.toString()), null, 4) : message)
})
