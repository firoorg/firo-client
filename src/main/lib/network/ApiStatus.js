import zmq from 'zeromq'
import types from '~/types'

import { tryUntil } from '#/lib/utils'

// let apiStatus = zmq.socket('req')

export const getApiStatus = async function ({ host, port }) {
    let apiStatus = null

    return new Promise((resolve, reject) => {
        let requestStatusInterval = null
        let counter = 0

        const onMessage = (msg) => {
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
                console.log(e)
                reject(new Error('error occured during api status fetching.', e))
            } finally {
                console.log('closing api status')
                apiStatus.close()
            }
        }

        requestStatusInterval = setInterval(function () {

            if (apiStatus) {
                apiStatus.close()
                apiStatus.removeListener('message', onMessage)
                apiStatus = null
            }

            apiStatus = zmq.socket('req')

            const uri = `${host}:${port}`

            apiStatus.connect(uri)
            apiStatus.setsockopt(zmq.ZMQ_RCVTIMEO, 100)
            apiStatus.setsockopt(zmq.ZMQ_SNDTIMEO, 100)

            console.log('requesting initial api status', counter, new Date())
            counter++

            apiStatus.send(JSON.stringify({
                type: 'initial',
                collection: 'apiStatus'
            }))

            apiStatus.once('message', onMessage)
        }, 400)
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
    dispatch(types.app.SET_BLOCKCHAIN_LOCATION, location)
}
