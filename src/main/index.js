'use strict'

// Note: Initialization of refactored zcoind interaction is done in src/renderer/main.js so it can be assigned to
// Vue.prototype.$daemon.

import { app } from 'electron'
import { join } from 'path'

import { createLogger } from '#/lib/logger'

import menu from './lib/menu'
import { populateStoreWithAppSettings } from './lib/appSettings'
import { setupLocales } from '#/lib/i18n'

import store from '../store/main'

import windowManager from './lib/windows'
import deeplink from './lib/deeplink'

import CONFIG from './config'
const logger = createLogger('zcoin:main')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// build settings via electron-settings module
if (!app.isDefaultProtocolClient(CONFIG.app.protocolIdentifier)) {
    logger.info('registering protocol handler "%s"', CONFIG.app.protocolIdentifier)
    app.setAsDefaultProtocolClient(CONFIG.app.protocolIdentifier)
}

const beforeQuit = async () => {
    app.exit(0)
}

app.on('ready', async () => {
    setupLocales({ store })
    await populateStoreWithAppSettings({ store })

    deeplink.init({ windowManager, store })

    windowManager.connectToStore({ store, namespace: 'Window' })
    windowManager.registerWindows(CONFIG.windows)
    windowManager.setupAppEvents()

    menu.init({ app, store })
    store.dispatch('Window/show', 'main')
})

app.on('window-all-closed', (event) => {
    logger.info('window-all-closed')
})

app.on('before-quit', async (event) => {
    logger.info('application before quit')
})

app.on('will-quit', (event) => {
    logger.info('application will quit')
})