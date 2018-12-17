import mixin from './mixin'
import types from '~/types'

import Debug from 'debug'
const debug = Debug('zcoin:network:app')

export default {

    ...mixin,
    ...({
        namespace: 'App',

        mutations: {
            [types.app.DAEMON_STOP]: 'stopDaemon',
            [types.app.LOCK_WALLET]: 'lockWallet'
        }
    }),

    stopDaemon () {
        debug('stopping the daemon')

        this.send({
            collection: 'stop',
            type: 'initial'
        })
    },

    lockWallet (payload) {
        debug('GOING TO LOCK WALLET', payload)
        const { passphrase } = payload

        this.send({
            collection: 'setPassphrase',
            type: 'create',
            auth: {
                passphrase
            }
        }, {
            onSuccess: types.app.DAEMON_STOP,
            onError: ({ _meta, error }) => {
                console.log('on setPassphrase error!', _meta, error)
                // this.dispatchAction(types.app.DAEMON_RESTART)
            }
        })
    }
}
