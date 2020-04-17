import {app, protocol, BrowserWindow} from 'electron'

import { createLogger } from '#/lib/logger'
import { populateStoreWithAppSettings } from './lib/appSettings'
import { setupLocales } from '#/lib/i18n'
import store from '../store/main'

const logger = createLogger('zcoin:main')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Register us as the handler for zcoin:// links so deeplinks work. Actual handling of them is done in main.js.
if (!app.isDefaultProtocolClient('zcoin')) {
    logger.info("Setting Zcoin Client as the default handler for zcoin:// links...");
    app.setAsDefaultProtocolClient('zcoin');
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

    // Stop new alt-clicks from opening new BrowserWindows.
    //
    // NOTE: This MUST be done in the main process to work.
    //       cf. https://github.com/electron/electron/issues/2770#issuecomment-140065309
    //
    // FIXME: alt-clicking on a router link will still cause the link to be highlighted even though no other action is
    //        taken.
    window.webContents.on('new-window', (e) => e.preventDefault());

    if (process.env.NODE_ENV === 'development') {
        window.loadURL("http://localhost:9080/");
    }
    else {
        window.loadFile(`file://${__dirname}/index.html#${path}`);
    }
});