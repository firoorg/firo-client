import { Menu } from 'electron'
import { getModule } from '#/lib/i18n'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:menu')

export default {

    init ({ app, router, store }) {
        const i18n = getModule(app)

        const template = this.getTemplate({
            i18n,
            app,
            router,
            store
        })

        const menu = Menu.buildFromTemplate(template)

        logger.info('setting application menu')

        Menu.setApplicationMenu(menu)
    },

    getPreferences ({ i18n, store }) {
        return {
            label: i18n.t('application-menu.preferences.title'),
            accelerator: 'CmdOrCtrl+,',
            click () {
                store.commit(types.router.ROUTE_TO_SETTINGS)
            }
        }
    },

    getPaymentsMenu ({ i18n, store }) {
        return {
            label: i18n.t('application-menu.payments.title'),
            submenu: [
                {
                    label: i18n.t('application-menu.payments.label__create-payment-request'),
                    click () {
                        store.commit(types.router.ROUTE_TO_CREATE_PAYMENT_REQUEST)
                    }
                },
                {type: 'separator'},
                {
                    label: i18n.t('application-menu.payments.label__show-private-payments'),
                    click () {
                        store.commit(types.router.ROUTE_TO_PRIVATE_SPEND)
                    }
                },
                {
                    label: i18n.t('application-menu.payments.label__show-public-payments'),
                    click () {
                        store.commit(types.router.ROUTE_TO_PUBLIC_SEND)
                    }
                }
            ]
        }
    },

    getClientMenu ({ i18n, store }) {
        return {
            label: i18n.t('application-menu.client.title'),
            submenu: [
                {
                    label: i18n.t('application-menu.client.label__create-wallet-backup'),
                    click () {
                        console.log('dispatching wallet create')
                        store.dispatch(types.backup.CREATE_BACKUP)
                    }
                }
            ]
        }
    },

    getTemplate ({ app, i18n, router, store }) {
        const paymentsMenu = this.getPaymentsMenu({ i18n, store })
        const clientMenu = this.getClientMenu({ i18n, store })
        const preferences = this.getPreferences({ i18n, store })

        const template = [
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {type: 'separator'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'pasteandmatchstyle'},
                    {role: 'delete'},
                    {role: 'selectall'}
                ]
            },
            paymentsMenu,
            {
                label: clientMenu.label,
                submenu: [
                    ...clientMenu.submenu,
                    {type: 'separator'},
                    preferences
                ]
            },
            {
                label: 'View',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {type: 'separator'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {type: 'separator'},
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
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() {
                            require('electron').shell.openExternal('https://electronjs.org')
                        }
                    }
                ]
            }
        ]

        if (process.platform === 'darwin') {
            template.unshift({
                label: app.getName(),
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    preferences,
                    // todo preferences
                    {type: 'separator'},
                    ...clientMenu.submenu,
                    //{role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            })

            /*
            // Edit menu
            template[1].submenu.push(
                {type: 'separator'},
                {
                    label: 'Speech',
                    submenu: [
                        {role: 'startspeaking'},
                        {role: 'stopspeaking'}
                    ]
                }
            )
            */

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
