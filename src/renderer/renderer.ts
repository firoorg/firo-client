import {createApp} from 'vue';
import Tooltip from '../renderer/directives/tooltip';
import Focus from '../renderer/directives/focus';

import {isEqual} from 'lodash';
import {existsSync} from 'fs';
const App = require('./App').default;
import router from './router'
import store from '../store/renderer'

import firod from '../daemon/init'
import {getAppSettings} from "../lib/utils";
import {bigintToString, stringToBigint} from "../lib/convert";

import process from "process";
import {ipcRenderer} from "electron";


window['$daemon'] = undefined;
window['$store'] = undefined;
window['$router'] = undefined;
window['$setWaitingReason'] = undefined;
window['$quitApp'] = undefined;
window['$startDaemon'] = undefined;

// On exit, close firod sockets.
window.addEventListener('beforeunload', async () => await $daemon?.closeSockets());

(async () => {
    console.debug("Beginning render...");

    // Allow global access to the store and router.
    window['$store'] = store;
    window['$router'] = router;

    const appSettings = getAppSettings();
    const settings = await appSettings.getAll();

    if (!settings.isInitialized && settings['app.SET_IS_INITIALIZED']) {
        settings.isInitialized = settings['app.SET_IS_INITIALIZED'];
        settings.network = settings['app.SET_ZCOIN_CLIENT_NETWORK'];
        settings.blockchainLocation = settings['app.SET_BLOCKCHAIN_LOCATION'];

        await appSettings.set('app.SET_IS_INITIALIZED', false);
        await appSettings.set('app.SET_ZCOIN_CLIENT_NETWORK', false);
        await appSettings.set('app.SET_BLOCKCHAIN_LOCATION', false);

        await appSettings.set('isInitialized', settings.isInitialized);
        await appSettings.set('network', settings.network);
        await appSettings.set('blockchainLocation', settings.blockchainLocation);
    }

    if (process.env.NETWORK) settings.network = process.env.NETWORK;
    if (process.env.BLOCKCHAIN_LOCATION) settings.blockchainLocation = process.env.BLOCKCHAIN_LOCATION;
    if (process.env.FIROD_ARGS) settings.temporaryFirodArguments = process.env.FIROD_ARGS.split(' ');
    if (process.env.ELYSIUM) settings.enableElysium = !!JSON.parse(process.env.ELYSIUM);
    if (process.env.IS_INITIALIZED) {
        settings.isInitialized = !!JSON.parse(process.env.IS_INITIALIZED);
    } else if (process.env.NETWORK && process.env.BLOCKCHAIN_LOCATION) {
        settings.isInitialized = true;
    }

    if (settings.temporaryFirodArguments) {
        await appSettings.set('temporaryFirodArguments', false);
        store.commit('App/setTemporaryFirodArguments', settings.temporaryFirodArguments)
    }

    if (settings.isInitialized) {
        store.commit('App/setFiroClientNetwork', settings.network);
        store.commit('App/setBlockchainLocation', settings.blockchainLocation);
        store.commit('App/setIsInitialized', settings.isInitialized);
    }

    if (settings.colorTheme) {
        store.commit('App/setColorTheme', settings.colorTheme);
    }

    // if (settings.enableElysium) {
    //     store.commit('App/setEnableElysium', settings.enableElysium);
    // }
    store.commit('App/setEnableElysium', false);

    if (settings.selectedElysiumTokens) {
        store.commit('Elysium/initSelectedTokens', settings.selectedElysiumTokens);
    }

    if (settings.showMints) {
        store.commit('App/setShowMints', settings.showMints);
    }

    store.commit('App/setAppPath', await ipcRenderer.invoke('get-path', 'app'));
    store.commit('App/setUserDataPath', await ipcRenderer.invoke('get-path', 'userData'));

    // Load CoinSwap records from disk.
    await store.dispatch('CoinSwap/readRecordsFromFile');

    // Update outdated CoinSwap records every 60 seconds.
    setInterval(() => {
        store.dispatch('CoinSwap/updateOutdatedRecords');
    }, 60e3);

    const addElysiumTokenData = async () => {
        if (!store.getters['App/enableElysium']) return;
        const tokensNeedingData = store.getters['Elysium/selectedAndOwnedTokens'].filter(token => !store.getters['Elysium/tokenData'][token]?.id);
        if (!tokensNeedingData.length) return;
        store.commit('Elysium/addTokenData', await $daemon.getElysiumPropertyInfo(tokensNeedingData));
    };

    store.watch(() => store.getters['Elysium/selectedAndOwnedTokens'], async (selectedAndOwnedTokens, oldValue) => {
        if (isEqual(selectedAndOwnedTokens, oldValue)) return;
        while (!$daemon || !store.getters['ApiStatus/block1']) await new Promise(r => setTimeout(r, 1e3));
        await addElysiumTokenData();
    });

    store.watch(() => store.getters['Elysium/selectedTokens'], async (newValue, oldValue) => {
        if (isEqual(newValue, oldValue)) return;
        if (!store.getters['Elysium/hasModifiedSelectedTokens']) return;
        await getAppSettings().set('selectedElysiumTokens', store.getters['Elysium/allSelectedTokens']);
    });

    store.watch(() => store.getters['ApiStatus/currentBlockHeight'], async (newValue, oldValue) => {
        if (newValue != oldValue)
            await addElysiumTokenData();
    });

    // Show the waiting screen with reason, or, if reason may be undefined, close it.
    //
    // Note that the app starts off with the reason "Loading..." in order to not show the main window for a short time
    // before starting the daemon.
    //
    // If final is true, subsequent messages not marked with final will not be displayed.
    let preventNonFinalMessages = false;
    window['$setWaitingReason'] = (reason, final=false) => {
        if (reason) {
            console.info("Waiting: " + reason);
        }

        preventNonFinalMessages ||= final;
        if (preventNonFinalMessages && !final) return;

        store.commit('App/setWaitingReason', reason);
    }

    // Quit the application, shutting down $daemon if it exists. If message is set, log it and show it to the user before
    // continuing. We never resolve.
    window['$quitApp'] = async (message=undefined) => {
        if (message) {
            console.error(message);
            if (!process.env.FIRO_CLIENT_TEST) {
                alert(message);
            }
        }

        // $daemon will not be set if we are setting up.
        if ($daemon) {
            $setWaitingReason("Shutting down firod...", true);

            const shutDownSuccessful = !!await Promise.any([
                (async () => {
                    try {
                        await $daemon.stopDaemon();
                    } catch(e) {
                        console.error(`Error stopping daemon: ${e}`);
                    }

                    return true;
                })(),
                new Promise(r => setTimeout(r, 10e3))
            ]);

            if (!shutDownSuccessful) {
                $setWaitingReason("Forcibly killing firod...", true);

                // Windows doesn't support signals, so this is equivalent to SIGKILL there.
                console.info(`Killing firod (pid ${$daemon.pid}) with SIGTERM...`);
                process.kill($daemon.pid, 'SIGTERM');

                const killSuccessful = !!await Promise.any([
                    (async () => {await $daemon.awaitFirodStopped(); return true;})(),
                    new Promise(r => setTimeout(r, 20e3))
                ]);

                if (!killSuccessful) {
                    console.info(`Killing firod (pid ${$daemon.pid}) with SIGKILL...`);
                    process.kill($daemon.pid, 'SIGKILL');
                }
            }
        } else {
            console.warn("$daemon is not set; not trying to stop daemon");
        }

        console.info("Exiting app...");
        await ipcRenderer.invoke('exit');
    }

    ipcRenderer.on('shutdown-requested', async () => {
        await $quitApp();
    });

    // Actually handle deeplinks. open-url is emitted by our own code on Windows.
    ipcRenderer.on('open-url', (ev, url) => {
        if (!store.getters['App/isInitialized'] || store.getters['App/waitingReason']) {
            console.error(`We're waiting on firod or not yet initialized. Ignoring deeplink ${url}...`);
            return;
        }

        console.info(`Opening link: ${url}`);

        const m = (pattern) => (url.match(pattern) || [])[1];

        const address = m(/^firo:\/\/(\w+)/);
        const amount = m(/[?&]amount=([0-9.]+)/);
        const label = m(/[?&]message=([^&]+)/);

        router.push({
            path: '/send',
            query: {
                address: address,
                amount: amount && bigintToString(stringToBigint(amount)),
                label: decodeURI(label || '')
            }
        });
    });

    function startVue() {
        // Start the GUI.
        console.debug('Starting Vue...');
        const vue = createApp(App);
        vue.directive('focus', Focus);
        vue.directive('tooltip', Tooltip);
        vue.use(router);
        vue.use(store);
        vue.mount('#app-container');
    }

    // Start the daemon, showing progress to the user and resolving when the daemon is fully started. App/isInitialized is
    // set to true if the daemon is started successfully and the wallet is locked.
    window['$startDaemon'] = () => new Promise<void>(async resolve => {
        // Don't restart firod when we refresh the page.
        const isFirstStartup = (await ipcRenderer.invoke('count')) == 0;

        $setWaitingReason("Starting up firod...");
        const args = [...store.getters['App/temporaryFirodArguments']];
        if (store.getters['App/enableElysium']) args.push('-elysium');
        console.info(`Starting ${store.getters['App/firodLocation']} with wallet ${store.getters['App/walletLocation']}...`);
        firod(store, store.getters['App/firoClientNetwork'], store.getters['App/firodLocation'],
            store.getters['App/blockchainLocation'] || null, undefined,
            !!(!isFirstStartup || (process.env.ALLOW_EXISTING_FIROD && JSON.parse(process.env.ALLOW_EXISTING_FIROD))),
            true, process.env.FIROD_CONNECTION_TIMEOUT ? Number(process.env.FIROD_CONNECTION_TIMEOUT) : undefined,
            args)
            .then(async z => {

                // Make $daemon globally accessible.
                window['$daemon'] = z;

                $daemon.awaitShutdown().catch(() => {
                    $quitApp("firod has shutdown unexpectedly. See firod's debug.log for details.");
                });

                $setWaitingReason("Waiting for firod to start the API...");
                await $daemon.awaitApiResponse();

                if (await $daemon.isReindexing() || await $daemon.isRescanning()) {
                    const action = (await $daemon.isReindexing()) ? 'reindex' : 'rescan';

                    let interval = setInterval(async () => {
                        const progress = (((await $daemon.apiStatus()).data.reindexingProgress || 0) * 100).toPrecision(3);
                        $setWaitingReason(`(${progress}%) Waiting for firod to ${action}. This may take an extremely long time...`);
                    }, 500);

                    await $daemon.awaitBlockchainLoaded();
                    clearInterval(interval);
                }

                $setWaitingReason("Waiting for the API to indicate it's ready to receive commands...");
                await $daemon.awaitApiIsReady();

                $setWaitingReason("Connecting to firod...")
                await $daemon.awaitHasConnected();

                if (await $daemon.isWalletLocked()) {
                    // Start up the daemon.

                    $setWaitingReason("Loading our state from firod...");
                    try {
                        // Make sure our state is updated before proceeding.
                        await $daemon.awaitInitializersCompleted();
                    } catch (e) {
                        await $quitApp(`An error occurred in our initializers: ${e}`);
                    }

                    await addElysiumTokenData();

                    console.info("firod has started.");
                    $setWaitingReason(undefined);

                    if (!store.getters['App/isInitialized'])
                        await store.dispatch('App/setIsInitialized', true);

                    resolve();
                } else {
                    // Direct the user to the lock wallet screen. We will never resolve(), but that shouldn't matter.

                    router.push({
                        path: '/setup/lock-wallet',
                        query: {
                            isExistingWallet: true
                        }
                    }).then(() => {
                        $setWaitingReason(undefined);
                    });
                }
            })
            .catch(async e => {
                await $quitApp(`An error occured starting firod: ${e}`);
            });
    });

    if (process.env.FIRO_CLIENT_REPL === 'true') {
        // Allow shutting down.
        $setWaitingReason(undefined);
        window['Firod'] = require('../daemon/firod').Firod;
    } else if (store.getters['App/isInitialized'] &&
               existsSync(store.getters['App/walletLocation'])) {
        startVue();
        try {
            await $startDaemon()
            await router.push("/main");
        } catch (e) {
            // We want to ignore NavigationDuplicated errors because they'll happen whenever we reload from the main
            // page.
            if (e.name !== 'NavigationDuplicated') throw e;
        }
    } else {
        console.info("App is not yet initialized. Let's get 'er ready!");

        $setWaitingReason(undefined);
        startVue();
        router.push("/setup/welcome");
    }
})();