'use strict'

import Debug from 'debug'
import os from 'os'
import { app } from 'electron'
import { join } from 'path'

import PidManager from './lib/core/PidManager'
import network from './lib/network'

import store from '../store/main'
import windowManager from './lib/windows'
import deeplink from './lib/deeplink'
import clipboard from './lib/clipboard'

import CONFIG from './config'
const debug = Debug('zcoin:main')

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

debug({
    rootFolder,
    unpackedRootFolder,
    zcoindPath,
    userDataPath,
    pathToStorePid
})

// build settings via electron-settings module
if (!app.isDefaultProtocolClient(CONFIG.app.protocolIdentifier)) {
    debug('registering protocol handler "%s"', CONFIG.app.protocolIdentifier)
    app.setAsDefaultProtocolClient(CONFIG.app.protocolIdentifier)
}

// get core config
const { autoRestart, heartbeatIntervalInSeconds, stopOnQuit } = CONFIG.app.core

store.replaceState(require('../store/initialState'))

const startNetwork = function () {
    debug('STARTING NETWORK')

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

// start it!
debug('zcoindPath', zcoindPath)
coreDaemonManager.start(zcoindPath)

// tor proxy
// https://electronjs.org/docs/api/app#appcommandlineappendswitchswitch-value
// https://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
// app.commandLine.appendSwitch('proxy-server', 'socks5://127.0.0.1:9050')

deeplink.init({ windowManager, store })

windowManager.connectToStore({ store, namespace: 'Window' })
windowManager.registerWindows(CONFIG.windows)
windowManager.setupAppEvents()

app.on('ready', () => {
    store.dispatch('Window/show', 'main')

    clipboard.watch({ store, deeplink })
})

app.on('before-quit', async (event) => {
    console.log('app before quit')
    const isRunning = await coreDaemonManager.isRunning()

    if (stopOnQuit && isRunning) {
        coreDaemonManager.stop()
    }
})

app.on('will-quit', () => {
    console.log('app will quit')
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
