import { Menu } from 'electron'
import { getModule } from '#/lib/i18n'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:menu')

export default {

    init ({ app, router, store }) {
        const buildTemplate = (i18n) => {
            const template = this.getTemplate({
                i18n,
                app,
                router,
                store
            })

            this.build(template)
        }

        const i18n = getModule({ app, store, onLocaleChange: () => {
            buildTemplate(i18n)
        }})

        buildTemplate(i18n)
    },

    build (template) {
        const menu = Menu.buildFromTemplate(template)
        logger.info('setting application menu')
        Menu.setApplicationMenu(menu)
    },

    getTemplate ({ app }) {
        const template = [
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'pasteandmatchstyle'},
                    {role: 'delete'},
                    {role: 'selectall'}
                ]
            },
            {
                label: 'View',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {role: 'togglefullscreen'}
                ]
            },
            {
                role: 'window',
                submenu: [
                    {role: 'minimize'},
                    {role: 'close'}
                ]
            },
        ]

        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    {role: 'about'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            })

            // Window menu
            template[3].submenu = [
                {role: 'close'},
                {role: 'minimize'},
                {role: 'zoom'},
                {type: 'separator'},
                {role: 'front'}
            ]
        }

        return template
    }
}
