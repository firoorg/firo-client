import fs from "fs";
import path from "path";
import {app, session, ipcMain, BrowserWindow, Menu, MenuItem, dialog} from 'electron';

import menuTemplate from './lib/menuTemplate';
import OpenDialogOptions = Electron.OpenDialogOptions;

// If app is not defined, this file is being required from renderer context because webpack, so we don't want to do anything.
if (app) {
    console.info('Entering main.ts...');

    process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
        if (reason instanceof Error)
            console.error(`Unhandled Rejection ${reason.name}: ${reason.message}:\n${reason.stack}`);
        else
            console.error('Unhandled Rejection: ${reason}');
    });

    const LOG = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    }[process.env.LOG] || Number(process.env.LOG) || 1;

    // We don't want multiple copies of our application running.
    if (!app.requestSingleInstanceLock()) {
        app.focus();
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
        console.info("Setting Firo Client as the default handler for firo:// links...");
        // This can sometimes fail, in which case it will not throw but will print an error to stderr.
        app.setAsDefaultProtocolClient('firo');
    }

    app.once('ready', async () => {
        // Set the application menu. This is required for keyboard shortcuts (including copy+paste) to work correctly.
        const appMenu = Menu.buildFromTemplate(<any>menuTemplate); // FIXME
        Menu.setApplicationMenu(appMenu);

        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({ responseHeaders: details.responseHeaders });

            // Inject CORS headers
            details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
            details.responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE'];
            details.responseHeaders['Access-Control-Allow-Headers'] = ['Authorization, Content-Type'];
          });

        // The window will be shown by the renderer process when firod is connected.
        const ourWindow = new BrowserWindow({
            frame: process.platform !== 'darwin',
            useContentSize: true,
            titleBarStyle: 'hiddenInset',
            height: 800,
            width: 1400,
            minWidth: 1250,
            minHeight: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            }
        });
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({ responseHeaders: details.responseHeaders });

        // Inject CORS headers
        details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
        details.responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE'];
        details.responseHeaders['Access-Control-Allow-Headers'] = ['Authorization, Content-Type'];
      });

        const logPath = path.join(app.getPath('userData'), 'firo-client.log');
        // This will overwrite the old log so as to reduce clutter.
        const logFile = await fs.promises.open(logPath, 'w');
        ourWindow.webContents.on('console-message', async (event, level, msg, line, source) => {
            if (level < LOG) return;

            let location = `${source}:${line}`;

            const levelStrs = {
                0: 'debug',
                1: 'info',
                2: 'warn',
                3: 'error',
            };
            const levelStr: 'debug' | 'info' | 'warn' | 'error' = levelStrs[level] || 'info';

            await logFile.write(`${levelStr}: ${msg} (${location})\n`);

            const red = '\x1b[31m';
            const reset = '\x1b[0m';
            const log = console[levelStr];
            if (level >= 2)
                log(`${red}${levelStr}${reset}: ${msg} (${location})`);
            else
                log(`${levelStr}: ${msg} (${location})`);
        });

        // Fire the shutdown-requested listener in renderer/main.js when the user tries to close us.
        ourWindow.on('close', (event) => {
            event.preventDefault();
            ourWindow.webContents.send('shutdown-requested');
        });

        // Removing old listeners on navigation is ecessary to prevent warnings when we quit while hot reloading is enabled.
        ourWindow.webContents.on("will-navigate", () => {
            ourWindow.webContents.removeAllListeners('shutdown-requested');
        });

        ipcMain.handle('exit', () =>
            app.exit()
        );

        ipcMain.handle('get-path', (ev, name) =>
            name == 'app' ? app.getAppPath() : app.getPath(name)
        );

        ipcMain.handle('select-directory', async (ev, options: OpenDialogOptions): Promise<string[] | undefined> => {
            const r = await dialog.showOpenDialog(ourWindow, options);
            if (r.canceled) return;
            return r.filePaths;
        });

        ipcMain.handle('show-context-menu', async (ev, menuItems: string[]) => {
            return await new Promise(resolve => {
                const menu = new Menu();

                for (const menuItem of menuItems)
                    menu.append(new MenuItem({
                        label: menuItem,
                        click() {
                            resolve(menuItem);
                        }
                    }));

                menu.popup({callback() { resolve(null); }});
            });
        });

        // This is used to check if we're reloading, so we can avoid restarting firod.
        let count = 0;
        ipcMain.handle('count', () => count++);

        app.on('open-url', async (ev, msg) => {
            ev.preventDefault();
            ourWindow.webContents.emit('open-url', msg);
        });

        // Stop new alt-clicks from opening new BrowserWindows.
        //
        // NOTE: This MUST be done in the main process to work.
        //       cf. https://github.com/electron/electron/issues/2770#issuecomment-140065309
        //
        // FIXME: alt-clicking on a router link will still cause the link to be highlighted even though no other action is
        //        taken.
        ourWindow.webContents.setWindowOpenHandler(() => ({action: 'deny'}));

        if (process.env.FIRO_CLIENT_TEST) {
            const indexDotHtml = path.join(app.getAppPath(), 'index.html');
            console.info(`Loading test environment at ${indexDotHtml}...`);
            await ourWindow.loadFile(indexDotHtml);
        } else if (process.env.NODE_ENV === 'development') {
            console.info("Loading development environment at localhost:9080...");
            // ?reload=true is required for WebPack hot reloading to work without a manual refresh.
            await ourWindow.loadURL("http://localhost:9080/?reload=true");
        } else if (process.env.NODE_ENV === 'production') {
            const indexDotHtml = path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'dist', 'electron', 'index.html');
            console.info(`Loading production environment at ${indexDotHtml}...`);
            await ourWindow.loadFile(indexDotHtml);
        } else {
            console.error("NODE_ENV must be set for us to determine where to load our content from.");
            app.exit(1);
        }
    });
}