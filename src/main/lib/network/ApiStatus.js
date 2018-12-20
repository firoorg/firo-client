import zmq from 'zeromq'
import types from '~/types'

import { tryUntil } from '#/lib/utils'

// let apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, port }) {
    let apiStatus = zmq.socket('req')
    const uri = `${host}:${port}`

    apiStatus.connect(uri)

    return new Promise((resolve, reject) => {
        let requestStatusInterval = null
        let counter = 0

        apiStatus.once('message', (msg) => {
            console.log('got message back from api status', counter)
            clearInterval(requestStatusInterval)
            try {
                const { data, meta, error } = JSON.parse(msg.toString())

                if (error || (meta.status < 200 && meta.status >= 400)) {
                    reject(new Error('error occured during api status fetching.', error))
                    return
                }
                resolve({ data, meta })
            } catch (e) {
                reject(new Error('error occured during api status fetching.', e))
            } finally {
                console.log('closing api status')
                apiStatus.close()
            }
        })

        requestStatusInterval = setInterval(() => {
            console.log('requesting initial api status', counter)
            counter++
            apiStatus.send(JSON.stringify({
                type: 'initial',
                collection: 'apiStatus'
            }))
        }, 200)
    })
}

export const closeApiStatus = function () {
    try {
        console.log('deprecated...')
        // apiStatus.close()
    } catch (e) {
        console.log('api status close', e)
    }
}

export const waitForApi = async function ({ host, port, apiStatus, ttlInSeconds }) {
    const validator = ({ status, data }) => {
        const { modules = {}, walletVersion } = data

        console.log('validating --------->', status, data)

        return status === 200 && modules.API && walletVersion
    }

    const { meta, data } = apiStatus
    if (validator({ status: meta.status, data })) {
        console.log('given status is valid. no need to loose time...')
        return apiStatus
    }

    return tryUntil({
        functionToTry: async () => {
            return getApiStatus({ host, port })
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

    const { walletLock, dataDir: location } = data
    console.log('populateStore', data)

    if (walletLock !== undefined) {
        dispatch(types.app.SET_CLIENT_LOCKED, walletLock)
    }
    // dispatch(types.blockchain.SET_BLOCKCHAIN_TIP, blocks)
    dispatch(types.settings.SET_BLOCKCHAIN_LOCATION, { location })

    dispatch(types.app.IS_READY)
}
