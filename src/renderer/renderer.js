import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import AsyncComputed from "vue-async-computed";
import Focus from 'renderer/directives/focus'

import {isEqual} from 'lodash';
import Big from 'big.js';
import {existsSync} from 'fs';

import i18n from 'lib/i18n'

const electron = require('electron');
const remote = electron.remote;
const app = electron.remote.app;

import BindScopedSlotsPlugin from 'renderer/plugins/BindScopedSlotsPlugin'
import Logger from 'renderer/plugins/Logger'

import App from './App'
import router from './router'
import store from '../store/renderer'

import firod from '../daemon/init'
import {getAppSettings} from "lib/utils";
import {convertToCoin} from "lib/convert";

import { createLogger } from 'lib/logger';
import process from "process";
const logger = createLogger('firo:renderer:main.js');

logger.info("Entering renderer/main.js...");

let ourWindow = remote.getCurrentWindow();

require('./utils/validationRules/isFiroAddress');
require('./utils/validationRules/notExceedingBalance');

Vue.use(VTooltip, {
    defaultBoundariesElement: 'default-tooltip-boundary',
    defaultContainer: '#app'

})
Vue.use(AsyncComputed);
Vue.use(VueTimeago, {
    name: 'Timeago', // Component name, `Timeago` by default
    locale: i18n.getLocale({ app, store }), // Default locale
    locales: {
        // 'zh-CN': require('date-fns/locale/zh_cn'),
        'en': require('date-fns/locale/en')
    }
})
Vue.use(VeeValidate, {
    errorBagName: 'validationErrors',
    fieldsBagName: 'validationFields',
    inject: false
})
Vue.directive('focus', Focus)
Vue.use(BindScopedSlotsPlugin)
Vue.use(Logger)

Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// Allow global access to the store and router.
window.$store = store;
window.$router = router;

// Load CoinSwap records from disk.
store.dispatch('CoinSwap/readRecordsFromFile').then(() => {
    // Update outdated CoinSwap records every 60 seconds.
    setInterval(() => {
        store.dispatch('CoinSwap/updateOutdatedRecords');
    }, 60e3);
});

// Make sure we always have information about our selected tokens.
let lastSelectedTokens = [];
$store.watch(() => $store.getters['Elysium/selectedTokens'], async (newValue, oldValue) => {
    if (isEqual(newValue, oldValue)) return;
    console.log('abc');
    while (!window.$daemon || !$store.getters['ApiStatus/block1']) await new Promise(r => setTimeout(r, 1e3));
    const coins = $store.getters['Elysium/selectedTokens'];

    const tokenData = $store.getters['Elysium/tokenData'];
    const coinsNeedingData = coins.filter(coin => !tokenData[coin]);
    const coinData = (await Promise.all(coinsNeedingData.map(async coin => {
        try {
            return await $daemon.getElysiumPropertyInfo(coin);
        } catch (e) {
            console.warn(`Failed to get elysium property info for ${coin}: ${e}`);
        }
    }))).filter(x=>x);

    $store.commit('Elysium/addTokenData', coinData);

    if ($store.getters['Elysium/hasModifiedSelectedTokens'] && !isEqual(coins.sort(), lastSelectedTokens.sort())) {
        await getAppSettings().set('selectedElysiumTokens', $store.getters['Elysium/allSelectedTokens']);
        lastSelectedTokens = coins.sort();
    }
}, {immediate: true});

$store.watch(() => $store.getters['ApiStatus/currentBlockHeight'], async (newValue, oldValue) => {
    if (newValue == oldValue) return;

    const tokenData = $store.getters['Elysium/tokenData'];
    const coinsNeedingData = Object.values(tokenData).filter(td => !td.id).map(td => td.creationTx);
    const coinData = await Promise.all(coinsNeedingData.map(coin => $daemon.getElysiumPropertyInfo(coin)));
    $store.commit('Elysium/addTokenData', coinData);
})

// Show the waiting screen with reason, or, if reason may be undefined, close it.
//
// Note that the app starts off with the reason "Loading..." in order to not show the main window for a short time
// before starting the daemon.
//
// If final is true, subsequent messages not marked with final will not be displayed.
let preventNonFinalMessages = false;
window.$setWaitingReason = (reason, final=false) => {
    if (reason) {
        logger.info("Waiting: " + reason);
    }

    preventNonFinalMessages ||= final;
    if (preventNonFinalMessages && !final) return;

    $store.commit('App/setWaitingReason', reason);
}

// Quit the application, shutting down $daemon if it exists. If message is set, log it and show it to the user before
// continuing. We never resolve.
window.$quitApp = async (message=undefined) => {
    if (message) {
        logger.error(message);
        if (!process.env.FIRO_CLIENT_TEST) {
            alert(message);
        }
    }

    // $daemon will not be set if we are setting up.
    if (window.$daemon) {
        $setWaitingReason("Shutting down firod...", true);

        const shutDownSuccessful = !!await Promise.any([
            (async () => {
                try {
                    await $daemon.stopDaemon();
                } catch(e) {
                    logger.error(`Error stopping daemon: ${e}`);
                }

                return true;
            })(),
            new Promise(r => setTimeout(r, 10e3))
        ]);

        if (!shutDownSuccessful) {
            $setWaitingReason("Forcibly killing firod...", true);

            const pid = (await $daemon.apiStatus()).data.pid;
            // Windows doesn't support signals, so this is equivalent to SIGKILL there.
            logger.info(`Killing firod (pid ${pid}) with SIGTERM...`);
            process.kill(pid, 'SIGTERM');

            const killSuccessful = !!await Promise.any([
                (async () => {await $daemon.awaitFirodNotListening(); return true;})(),
                new Promise(r => setTimeout(r, 5e3))
            ]);

            if (!killSuccessful) {
                logger.info(`Killing firod (pid ${pid}) with SIGKILL...`);
                process.kill(pid, 'SIGKILL');
            }
        }
    } else {
        logger.warn("$daemon is not set; not trying to stop daemon");
    }

    logger.info("Exiting app...");
    app.exit();
}

// This event is fired from the main/index.js. It will prevent the default event, so we are responsible for closing the
// process now.
ourWindow.webContents.on('shutdown-requested', async () => {
    await $quitApp();
});

// Removing old listeners on navigation is ecessary to prevent warnings when we quit while hot reloading is enabled.
ourWindow.webContents.once("will-navigate", () => {
    ourWindow.webContents.removeAllListeners('shutdown-requested');
});

// Handle firo:// links on Windows.
app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (ourWindow.isMinimized()) {
        ourWindow.restore();
    }
    ourWindow.focus();

    // Emulate the link-opening behaviour of OSX.
    if (process.platform === "win32") {
        const url = commandLine.slice(1).join(" ");

        if (url) {
            app.emit('open-url', event, url);
        }
    }
});

// Actually handle deeplinks. open-url is emitted by our own code on Windows.
logger.info("Registering protocol handler for firo links...");
app.on('open-url', (event, url) => {
    if (!store.getters['App/isInitialized'] || store.getters['App/waitingReason']) {
        logger.error(`We're waiting on firod or not yet initialized. Ignoring deeplink ${url}...`);
        return;
    }

    logger.info(`Opening deeplink: ${url}`);

    const m = (pattern) => (url.match(pattern) || [])[1];

    const address = m(/^firo:\/\/(\w+)/);
    const amount = m(/[?&]amount=([0-9]+)/);
    const label = m(/[?&]message=([^&]+)/);

    router.push({
        path: '/send',
        query: {
            address: address,
            amount: amount && convertToCoin(amount),
            label: decodeURI(label || '')
        }
    });
});

function startVue() {
    // Start the GUI.
    new Vue({
        components: {App},
        router,
        store,
        i18n: i18n.getModule({app, store}),
        template: '<App/>'
    }).$mount('#app');
}

// Start the daemon, showing progress to the user and resolving when the daemon is fully started. App/isInitialized is
// set to true if the daemon is started successfully and the wallet is locked.
window.$startDaemon = () => new Promise(resolve => {
    // Checking for firodHasStarted allows us to work properly with hot reloading.

    $setWaitingReason("Starting up firod...");
    firod(store, store.getters['App/firoClientNetwork'], store.getters['App/firodLocation'],
        store.getters['App/blockchainLocation'] || null, undefined,
        store.getters['App/firodHasStarted'] || process.env.ALLOW_EXISTING_FIROD && JSON.parse(process.env.ALLOW_EXISTING_FIROD),
        !store.getters['App/firodHasStarted'] && process.env.ALLOW_EXISTING_FIROD && JSON.parse(process.env.ALLOW_EXISTING_FIROD),
        process.env.FIROD_CONNECTION_TIMEOUT ? Number(process.env.FIROD_CONNECTION_TIMEOUT) : undefined,
        store.getters['App/temporaryFirodArguments'] || [])
        .then(async z => {
            // Make $daemon globally accessible.
            window.$daemon = z;

            $daemon.awaitShutdown().catch(() => {
                $quitApp("firod has shutdown unexpectedly. See firod's debug.log for details.");
            });

            $setWaitingReason("Waiting for firod to start the API...");
            await $daemon.awaitApiResponse();

            if (await $daemon.isReindexing() || await $daemon.isRescanning()) {
                const action = (await $daemon.isReindexing()) ? 'reindex' : 'rescan';

                let interval = setInterval(async () => {
                    const progress = Big(((await $daemon.apiStatus()).data.reindexingProgress || 0) * 100).round(3).toString();
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

                // Do a fixed wait so that we have time to update to the state wallet entries that have been sent. It's
                // only required on first load, not any subsequent reloads.
                if (!store.getters['App/firodHasStarted']) {
                    await new Promise(r => setTimeout(r, 2e3));
                }

                logger.info("firod has started.");
                $setWaitingReason(undefined);
                store.commit('App/setFirodHasStarted', true);
                if (!$store.getters['App/isInitialized']) await store.dispatch('App/setIsInitialized', true);
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

    window.Firod = require('../daemon/firod').Firod;

    ourWindow.webContents.openDevTools();
} else if (store.getters['App/isInitialized'] &&
           existsSync(store.getters['App/walletLocation'])) {
    startVue();
    ourWindow.show();
    $startDaemon().then(async () => {
        try {
            await router.push("/main");
        } catch (e) {
            // We want to ignore NavigationDuplicated errors because they'll happen whenever we reload from the main
            // page.
            if (e.name !== 'NavigationDuplicated') throw e;
        }
    });
} else {
    logger.info("App is not yet initialized. Let's get 'er ready!");

    $setWaitingReason(undefined);
    startVue();
    router.push("/setup/welcome").then(() => {
        ourWindow.show();
    });
}
