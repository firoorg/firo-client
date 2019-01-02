import mixin from './mixin'
import types from '~/types'

import Debug from 'debug'
const debug = Debug('zcoin:network:backup')

export default {

    ...mixin,
    ...({
        namespace: 'Backup',

        mutations: {
            [types.backup.CREATE_BACKUP]: 'createBackup'
        }
    }),

    createBackup({path}) {
        debug('sending backup directory', path)

        this.send({
            collection: 'backup',
            type: 'create',
            data: {
                directory: path
            }
        }, {
            onSuccess: types.backup.BACKUP_CREATED,
            onError: types.backup.BACKUP_FAILED
        })
    }
}
