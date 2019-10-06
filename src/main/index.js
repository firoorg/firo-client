'use strict'

// Note: Initialization of refactored zcoind interaction is done in src/renderer/main.js so it can be assigned to
// Vue.prototype.$daemon.

import os from 'os'
import { app } from 'electron'
import { join } from 'path'
import types from '~/types'

import { createLogger } from '#/lib/logger'

import PidManager from './lib/core/PidManager'
import menu from './lib/menu'
import network from './lib/network'
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

// const rootFolder = __static // process.env.NODE_ENV === 'development' ? process.cwd() : __static
const rootFolder = process.env.NODE_ENV === 'development' ? process.cwd() : app.getAppPath()
const unpackedRootFolder = rootFolder.replace('app.asar', 'app.asar.unpacked')

const platform = os.platform()
const zcoindName = platform === 'win32' ? 'zcoind.exe' : 'zcoind'
const zcoindPath = join(unpackedRootFolder, `/assets/core/${platform}/${zcoindName}`)

const userDataPath = app.getPath('userData')

logger.info('zcoin paths: %o', {
    rootFolder,
    unpackedRootFolder,
    zcoindPath,
    userDataPath
})

// build settings via electron-settings module
if (!app.isDefaultProtocolClient(CONFIG.app.protocolIdentifier)) {
    logger.info('registering protocol handler "%s"', CONFIG.app.protocolIdentifier)
    app.setAsDefaultProtocolClient(CONFIG.app.protocolIdentifier)
}

// get core config
const { autoRestart, heartbeatIntervalInSeconds, stopOnQuit } = CONFIG.app.core

const startNetwork = function () {
    logger.info('starting network')

    network.init({ store, coreDaemonManager })
}

const beforeQuit = async function (event) {
    store.dispatch(types.app.PERSIST_APP_VERSION)
    const isRunning = await coreDaemonManager.isRunning()

    if (!(stopOnQuit && isRunning)) {
        logger.info('no need to wait for daemon to stop. quitting...')
        network.close()
        store.dispatch('Window/close', 'waitForDaemonShutdown')
        app.exit(0)
        return
    }

    event.preventDefault()
    logger.info('stopping daemon')
    coreDaemonManager.stop()
    logger.info('waiting for daemon shutdown')
    try {
        await coreDaemonManager.waitForDaemonShutdown()
    }
    catch (e) {
        logger.warn(e)
    }
    finally {
        network.close()
        logger.debug('finally quitting')
        store.dispatch('Window/close', 'waitForDaemonShutdown')
        app.exit(0)
    }

}

// set up the manager
const coreDaemonManager = new PidManager({
    name: 'zcoind',
    pidDirectory: userDataPath,
    autoRestart,
    heartbeatIntervalInSeconds,
    store,
    onStarted: startNetwork
})

// tor proxy
// https://electronjs.org/docs/api/app#appcommandlineappendswitchswitch-value
// https://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
// app.commandLine.appendSwitch('proxy-server', 'socks5://127.0.0.1:9050')

app.on('ready', () => {
    logger.info('---- Starting Zcoin client ----')
    setupLocales({ store })
    populateStoreWithAppSettings({ store })

    // start it!
    logger.info('path to zcoind binary: %s', zcoindPath)

    coreDaemonManager.setPathToSpawn(zcoindPath)

    if (!store.getters['App/isInitialRun']) {
        coreDaemonManager.start()
    }

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
    await beforeQuit(event)
})

app.on('will-quit', (event) => {
    logger.info('application will quit')
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
