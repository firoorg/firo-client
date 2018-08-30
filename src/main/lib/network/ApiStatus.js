import zmq from 'zeromq'
import types from '~/types'

import { tryUntil } from '#/lib/utils'

let apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, ports }) {
    const uri = `${host}:${ports.status}`
    apiStatus.connect(uri)

    return new Promise((resolve, reject) => {
        apiStatus.once('message', (msg) => {
            try {
                const { data, meta, error } = JSON.parse(msg.toString())

                if (error || (meta.status < 200 && meta.status >= 400)) {
                    reject(new Error('error occured during api status fetching.', error))
                    return
                }
                resolve({ data, meta })
            } catch (e) {

            }
        })

        apiStatus.send(JSON.stringify({
            type: 'initial',
            collection: 'apiStatus'
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

export const populateStore = function ({ apiStatus, dispatch }) {
    const { data, meta } = apiStatus

    if (!meta || meta.status !== 200) {
        return
    }

    const { blocks, walletLock, dataDir: location } = data
    console.log(data)

    dispatch(types.app.SET_CLIENT_LOCKED, walletLock)
    dispatch(types.blockchain.SET_BLOCKCHAIN_TIP, blocks)
    dispatch(types.settings.SET_BLOCKCHAIN_LOCATION, { location })

    dispatch(types.app.IS_READY)
}
