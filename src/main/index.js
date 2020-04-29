import {app, BrowserWindow, Menu} from 'electron'
import { createLogger } from '#/lib/logger'
import { populateStoreWithAppSettings } from './lib/appSettings'
import { setupLocales } from '#/lib/i18n'
import {join} from 'path'
import menuTemplate from './lib/menuTemplate';
import store from '../store/main'

const logger = createLogger('zcoin:main')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = join(__dirname, 'static').replace(/\\/g, '\\\\')
}

// We don't want multiple copies of our application running.
if (!app.requestSingleInstanceLock()) {
    // The second-instance handler will be fired automatically.
    app.exit();
    process.exit();
}

// Register us as the handler for zcoin:// links. Actual handling of them is done in main.js.
if (!app.isDefaultProtocolClient('zcoin')) {
    logger.info("Setting Zcoin Client as the default handler for zcoin:// links...");
    // This can sometimes fail, in which case it will not throw but will print an error to stderr.
    app.setAsDefaultProtocolClient('zcoin');
}

app.once('ready', async () => {
    setupLocales({ store })
    await populateStoreWithAppSettings({ store })

    // Set the application menu. This is required for keyboard shortcuts (including copy+paste) to work correctly.
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);

    // The window will be shown by the renderer process when zcoind is connected.
    const ourWindow = new BrowserWindow({
        show: false,
        frame: process.platform !== 'darwin',
        useContentSize: true,
        titleBarStyle: 'hiddenInset',
        height: 780,
        width: 1400,
        minWidth: 1200,
        minHeight: 450
    });

    // Fire the shutdown-requested listener in renderer/main.js when the user tries to close us.
    ourWindow.on('close', (event) => {
        event.preventDefault();
        // This is picked up by a listener in renderer/main.js, which is responsible for actually exiting the applicaiton.
        ourWindow.webContents.emit("shutdown-requested", event);
    });

    // Stop new alt-clicks from opening new BrowserWindows.
    //
    // NOTE: This MUST be done in the main process to work.
    //       cf. https://github.com/electron/electron/issues/2770#issuecomment-140065309
    //
    // FIXME: alt-clicking on a router link will still cause the link to be highlighted even though no other action is
    //        taken.
    ourWindow.webContents.on('new-window', (e) => e.preventDefault());

    if (process.env.NODE_ENV === 'development') {
        logger.info("Loading development environment at localhost:9080...");
        ourWindow.loadURL("http://localhost:9080/");
    }
    else {
        const indexDotHtml = join(__dirname, 'index.html');
        logger.info(`Loading production environment at ${indexDotHtml}...`);
        ourWindow.loadFile(indexDotHtml);
    }
});