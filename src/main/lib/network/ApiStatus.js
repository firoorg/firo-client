const zmq = require('zeromq')

const apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, ports }) {
    apiStatus.connect(`${host}:${ports.status}`)

    return new Promise(resolve => {
        apiStatus.on('message', (msg) => {
            console.log(JSON.parse(msg.toString()))

            resolve(JSON.parse(msg.toString()))
            apiStatus.close()
        })

        apiStatus.send(JSON.stringify({
            type: 'get',
            collection: 'api-status'
        }))
    })
}
