'use strict'

import os from 'os'
import { app } from 'electron'
import { join } from 'path'
import types from '~/types'

import { createLogger } from '#/lib/logger'

import PidManager from './lib/core/PidManager'
import menu from './lib/menu'
import network from './lib/network'
import { populateStoreWithAppSettings } from './lib/appSettings'

import store from '../store/main'
import { setupWindowRouter } from '~/utils/routerHelper'

import windowManager from './lib/windows'
import deeplink from './lib/deeplink'
import clipboard from './lib/clipboard'

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

const userDataPath = process.env.NODE_ENV === 'development' ? rootFolder + '/assets/core' : app.getPath('userData')
const pathToStorePid = userDataPath

logger.info('zcoin paths: %o', {
    rootFolder,
    unpackedRootFolder,
    zcoindPath,
    userDataPath,
    pathToStorePid
})

// build settings via electron-settings module
if (!app.isDefaultProtocolClient(CONFIG.app.protocolIdentifier)) {
    logger.info('registering protocol handler "%s"', CONFIG.app.protocolIdentifier)
    app.setAsDefaultProtocolClient(CONFIG.app.protocolIdentifier)
}

// get core config
const { autoRestart, heartbeatIntervalInSeconds, stopOnQuit } = CONFIG.app.core

store.replaceState(require('../store/initialState'))
setupWindowRouter({ store })

const startNetwork = function () {
    logger.info('starting network')

    network.init({ store })
}

// set up the manager
const coreDaemonManager = new PidManager({
    name: 'core',
    path: pathToStorePid,
    autoRestart,
    heartbeatIntervalInSeconds,
    store,
    onStarted: startNetwork
})

if (stopOnQuit) {
    app.on('will-quit', () => {
        coreDaemonManager.stop()
    })
}

// tor proxy
// https://electronjs.org/docs/api/app#appcommandlineappendswitchswitch-value
// https://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
// app.commandLine.appendSwitch('proxy-server', 'socks5://127.0.0.1:9050')

app.on('ready', () => {
    logger.info('---- Starting Zcoin client ----')
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
    clipboard.watch({ store, deeplink })
})

app.on('before-quit', async (event) => {
    logger.info('application before quit')
    store.dispatch(types.app.PERSIST_APP_VERSION)
    const isRunning = await coreDaemonManager.isRunning()

    if (stopOnQuit && isRunning) {
        coreDaemonManager.stop()
    }
})

app.on('will-quit', () => {
    logger.info('application will quit')
    network.close()
    clipboard.unwatch()
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
