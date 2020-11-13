import {app, BrowserWindow, Menu} from 'electron'
import { createLogger } from 'lib/logger'
import { populateStoreWithAppSettings } from './lib/appSettings'
import { setupLocales } from 'lib/i18n'
import {join} from 'path'
import menuTemplate from './lib/menuTemplate';
import store from '../store/main'

const logger = createLogger('firo:main')

// We don't want multiple copies of our application running.
if (!app.requestSingleInstanceLock()) {
    // The second-instance handler will be fired automatically.
    app.exit();
    process.exit();
}

// Chromium sandboxing requires an suid helper binary to be present, but we want users to be able to install Firo
// Client without root. Therefore, we need to disable sandboxing. This shouldn't be a security risk since we don't have
// any untrusted code anyway.
app.commandLine.appendSwitch('--no-sandbox');
// Shared memory can't be used if the client is being run over SSH, and Chromium has a bug where it fails to
// automatically detect the situation. Therefore, if we detect we're being run over SSH, we will tell it to not use
// shared memory ourselves.
if (process.env.SSH_CLIENT) {
    app.commandLine.appendSwitch('--no-xshm');
}

// Register us as the handler for firo:// links. Actual handling of them is done in main.js.
if (!app.isDefaultProtocolClient('firo')) {
    logger.info("Setting Firo Client as the default handler for firo:// links...");
    // This can sometimes fail, in which case it will not throw but will print an error to stderr.
    app.setAsDefaultProtocolClient('firo');
}

app.once('ready', async () => {
    setupLocales({ store })
    await populateStoreWithAppSettings({ store })

    // Set the application menu. This is required for keyboard shortcuts (including copy+paste) to work correctly.
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);

    // The window will be shown by the renderer process when firod is connected.
    const ourWindow = new BrowserWindow({
        show: false,
        frame: process.platform !== 'darwin',
        useContentSize: true,
        titleBarStyle: 'hiddenInset',
        height: 780,
        width: 1400,
        minWidth: 1200,
        minHeight: 650,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
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

    if (process.env.ZCOIN_CLIENT_TEST) {
        const indexDotHtml = join(app.getAppPath(), 'index.html');
        logger.info(`Loading test environment at ${indexDotHtml}...`);
        await ourWindow.loadFile(indexDotHtml);
    } else if (process.env.NODE_ENV === 'development') {
        logger.info("Loading development environment at localhost:9080...");
        // ?reload=true is required for WebPack hot reloading to work without a manual refresh.
        await ourWindow.loadURL("http://localhost:9080/?reload=true");
    } else if (process.env.NODE_ENV === 'production') {
        const indexDotHtml = join(app.getAppPath(), '..', 'app.asar.unpacked', 'dist', 'electron', 'index.html');
        logger.info(`Loading production environment at ${indexDotHtml}...`);
        await ourWindow.loadFile(indexDotHtml);
    } else {
        logger.error("NODE_ENV must be set for us to determine where to load our content from.");
        app.exit(1);
    }
});
