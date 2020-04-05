import {app, BrowserWindow} from 'electron'

import { createLogger } from '#/lib/logger'
import { populateStoreWithAppSettings } from './lib/appSettings'
import { setupLocales } from '#/lib/i18n'
import store from '../store/main'
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

app.once('ready', async () => {
    setupLocales({ store })
    await populateStoreWithAppSettings({ store })

    // The window will be shown by the renderer process when zcoind is connected.
    let window = new BrowserWindow({
        show: false,
        frame: false,
        useContentSize: true,
        titleBarStyle: 'hiddenInset',
        height: 780,
        width: 1400,
        minWidth: 1200,
        minHeight: 450
    });

    if (process.env.NODE_ENV === 'development') {
        window.loadURL("http://localhost:9080/");
    }
    else {
        window.loadFile(`file://${__dirname}/index.html#${path}`);
    }
});