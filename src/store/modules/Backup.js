import { dialog } from 'electron'

import { isRenderer } from '#/lib/utils'
import * as types from '~/types/Backup'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:store:backup')

const state = {
}

const mutations = {
    // send to network
    [types.CREATE_BACKUP] () {}
}

const actions = {
    [types.CREATE_BACKUP] ({ commit }) {
        // call from main thread only
        if (isRenderer()) {
            return
        }

        const selection = dialog.showOpenDialog({
            title: '',
            properties: [
                'openDirectory',
                'createDirectory',
                'promptToCreate' // todo check tadhg
            ]
        })

        if (!selection || !selection.length || selection.length !== 1) {
            return
        }

        const [ path ] = selection

        // todo check tadhg if path must exist
        logger.info('selected backup destination path: %s', path)
        commit(types.CREATE_BACKUP, { path })
    },

    [types.BACKUP_CREATED] () {
    }
}

const getters = {
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
