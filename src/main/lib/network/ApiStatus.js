import zmq from 'zeromq'
import types from '~/types'
import { createLogger } from '#/lib/logger'
import { tryUntil } from '#/lib/utils'

const logger = createLogger('zcoin:network:apiStatus')

export const getApiStatus = async function ({ host, port }) {
    let apiStatus = null

    return new Promise((resolve, reject) => {
        let requestStatusInterval = null
        let counter = 0

        const onMessage = (msg) => {
            clearInterval(requestStatusInterval)

            try {
                const { data, meta, error } = JSON.parse(msg.toString())

                if (error || (meta.status < 200 && meta.status >= 400)) {
                    reject(new Error('error occured during api status fetching.', error))
                    return
                }
                resolve({ data, meta })
            } catch (e) {
                logger.error(e)
                reject(new Error('error occured during api status fetching.', e))
            } finally {
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

            logger.debug('requesting initial api status %d', counter)
            counter++

            apiStatus.send(JSON.stringify({
                type: 'initial',
                collection: 'apiStatus'
            }))

            apiStatus.once('message', onMessage)
        }, 400)
    })
}

/*
@deprecated
export const closeApiStatus = function () {
    try {
        console.log('deprecated...')
        // apiStatus.close()
    } catch (e) {
        console.log('api status close', e)
    }
}
*/

export const waitForApi = async function ({ host, port, apiStatus, ttlInSeconds }) {
    const validator = ({ status, data }) => {
        const { modules = {}, walletVersion } = data

        return status === 200 && modules.API && walletVersion
    }

    const { meta, data } = apiStatus
    if (validator({ status: meta.status, data })) {
        logger.debug('given status is valid. no need to loose time...')
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
    logger.info('populating store with api status %o', data)

    if (walletLock !== undefined) {
        dispatch(types.app.SET_CLIENT_LOCKED, walletLock)
    }

    dispatch(types.app.SET_BLOCKCHAIN_LOCATION, location)
}
