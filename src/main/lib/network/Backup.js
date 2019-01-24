import mixin from './mixin'
import types from '~/types'

import { createLogger } from '#/lib/logger'
const logger = createLogger('zcoin:network:backup')

export default {

    ...mixin,
    ...({
        namespace: 'Backup',

        mutations: {
            [types.backup.CREATE_BACKUP]: 'createBackup'
        }
    }),

    createBackup({path}) {
        logger.info('sending backup directory %s', path)

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
