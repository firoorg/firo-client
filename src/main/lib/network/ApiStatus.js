import { tryUntil } from '#/lib/utils'
import zmq from 'zeromq'
let apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, ports }) {
    const uri = `${host}:${ports.status}`
    apiStatus.connect(uri)

    return new Promise((resolve, reject) => {
        apiStatus.once('message', (msg) => {
            console.log(JSON.parse(msg.toString()))

            resolve(JSON.parse(msg.toString()))
            // todo reject based on status code / errors

            /*
            apiStatus.disconnect(uri)
            apiStatus.close()
            apiStatus = null
            */
        })

        apiStatus.send(JSON.stringify({
            type: 'initial',
            collection: 'apistatus'
        }))
    })
}

export const closeApiStatus = function () {
    try {
        apiStatus.close()
    } catch (e) {
        console.log('api status close', e)
    }
}

export const waitForApi = async function ({ host, ports, apiStatus, ttlInSeconds }) {
    console.log('waiting for api')
    const validator = ({ status, data }) => {
        const { modules = {} } = data

        return status === 200 && modules.API
    }

    const { meta, data } = apiStatus
    if (validator({ status: meta.status, data })) {
        console.log('given status is valid. no need to loose time...')
        return apiStatus
    }

    return tryUntil({
        functionToTry: async () => {
            return getApiStatus({ host, ports })
        },
        validator,
        ttlInSeconds
    })
}
