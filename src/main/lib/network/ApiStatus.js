import { tryUntil } from '#/lib/utils'
import zmq from 'zeromq'

const apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, ports }) {
    apiStatus.connect(`${host}:${ports.status}`)

    return new Promise((resolve, reject) => {
        apiStatus.once('message', (msg) => {
            console.log(JSON.parse(msg.toString()))

            resolve(JSON.parse(msg.toString()))
            // todo reject based on status code / errors

            // apiStatus.close()
        })

        apiStatus.send(JSON.stringify({
            type: 'initial',
            collection: 'apistatus'
        }))
    })
}

export const waitForApi = async function ({ host, ports, apiStatus }) {
    console.log('waiting for api')
    const validator = ({ status, data }) => {
        const { modules = {} } = data

        // todo remove parsing once issue #57 is closed
        return parseInt(status) === 200 && modules.API
    }

    const { meta, data } = apiStatus
    if (validator({ status: meta.status, data })) {
        console.log('given status is valid. no need to loose time...')
        return
    }

    return tryUntil({
        functionToTry: async () => {
            return getApiStatus({ host, ports })
        },
        validator,
        ttlInSeconds: 5
    })
}
