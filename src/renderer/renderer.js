import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import Scrollable from 'renderer/directives/scrollable'
import Focus from 'renderer/directives/focus'

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

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

import zcoind from '../daemon/init'

import {convertToCoin} from "lib/convert";

import { createLogger } from 'lib/logger';
const logger = createLogger('zcoin:renderer:main.js');

logger.info("Entering renderer/main.js...");

let ourWindow = remote.getCurrentWindow();

require('./utils/validationRules/isZcoinAddress');
require('./utils/validationRules/notExceedingBalance');

Vue.use(VTooltip, {
    defaultBoundariesElement: 'default-tooltip-boundary'
})

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
Vue.directive('scrollable', Scrollable)
Vue.directive('focus', Focus)
Vue.use(BindScopedSlotsPlugin)
Vue.use(Logger)

Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// automatically registering BaseComponents as Component (stripping of Base)
const requireComponent = require.context('./components', true, /Base[A-Z]\w+\.(vue|js)$/)
for (const fileName of requireComponent.keys()) {
    // Get component config
    const componentConfig = requireComponent(fileName)

    // Get PascalCase name of component
    const componentName = upperFirst(
        camelCase(
            // Strip the path, "Base" and extension from the filename
            fileName.substr(fileName.lastIndexOf('/')).replace(/^(.*)\.\w+$/, '$1')
        )
    )

    // Register component globally
    Vue.component(
        componentName,
        // Look for the component options on `.default`, which will
        // exist if the component was exported with `export default`,
        // otherwise fall back to module's root.
        componentConfig.default || componentConfig
    )
}

// Allow global access to the store and router.
window.$store = store;
window.$router = router;

// Show the waiting screen with reason, or, if reason may be undefined, close it.
//
// Note that the app starts off with the reason "Loading..." in order to not show the main window for a short time
// before starting the daemon.
window.$setWaitingReason = (reason) => {
    if (reason) {
        logger.info("Waiting: " + reason);
    }

    $store.commit('App/setWaitingReason', reason);
}

// Quit the application, shutting down $daemon if it exists. If message is set, log it and show it to the user before
// continuing. We never resolve.
window.$quitApp = async (message=undefined) => {
    if (message) {
        logger.error(message);
        if (process.env.ZCOIN_CLIENT_TEST) {
            alert(message);
        }
    }

    // $daemon will not be set if we are setting up.
    if (window.$daemon) {
        $setWaitingReason("Shutting down zcoind...");
        try {
            await $daemon.stopDaemon();
        } catch(e) {
            logger.error(`Error stopping daemon: ${e}`);
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
    if ($store.getters['App/waitingReason'] && !process.env.ZCOIN_CLIENT_TEST) {
        logger.warn("Ignoring shutdown attempt in a critical period.");
        return;
    }

    await $quitApp();
});

// Removing old listeners on navigation is ecessary to prevent warnings when we quit while hot reloading is enabled.
ourWindow.webContents.once("will-navigate", () => {
    ourWindow.webContents.removeAllListeners('shutdown-requested');
});

// Record our current location in the app so we can go back to it when a restart is required.
router.afterEach((to) => {
    logger.info(`Setting current route to ${to.path}`);
    // Route objects can't be put into the $store directly, so we have to extract just the relevant properties.
    $store.commit('App/setCurrentRoute', {
        path: to.path,
        params: to.params,
        query: to.query,
        hash: to.hash
    });
});

// Handle zcoin:// links on Windows.
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
logger.info("Registering protocol handler for zcoin links...");
app.on('open-url', (event, url) => {
    if (!store.getters['App/isInitialized'] || store.getters['App/waitingReason']) {
        logger.error(`We're waiting on zcoind or not yet initialized. Ignoring deeplink ${url}...`);
        return;
    }

    logger.info(`Opening deeplink: ${url}`);

    const m = (pattern) => (url.match(pattern) || [])[1];

    const address = m(/^zcoin:\/\/(\w+)/);
    const amount = m(/[?&]amount=([0-9]+)/);
    const label = m(/[?&]message=([^&]+)/);

    router.push({
        path: '/send/private',
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
    // Checking for zcoindHasStarted allows us to work properly with hot reloading.

    $setWaitingReason("Starting up zcoind...");
    zcoind(store, store.getters['App/zcoinClientNetwork'], store.getters['App/zcoindLocation'],
        store.getters['App/blockchainLocation'] || null, undefined,
        (store.getters['App/zcoindHasStarted'] && process.env.NODE_ENV === "development") || process.env.ALLOW_EXISTING_ZCOIND === "true",
        !store.getters['App/zcoindHasStarted'] && process.env.ALLOW_EXISTING_ZCOIND === "true",
        process.env.ZCOIND_CONNECTION_TIMEOUT ? Number(process.env.ZCOIND_CONNECTION_TIMEOUT) : undefined)
        .then(async z => {
            // Make $daemon globally accessible.
            window.$daemon = z;

            $daemon.awaitShutdown().catch(() => {
                $quitApp("zcoind has shutdown unexpectedly. See zcoind's debug.log for details.");
            });

            $setWaitingReason("Waiting for zcoind to start the API...");
            await $daemon.awaitApiResponse();

            if (await $daemon.isReindexing()) {
                $setWaitingReason("Waiting for zcoind to reindex. This may take an extremely long time...");
                await $daemon.awaitBlockchainLoaded();
            } else if (await $daemon.isRescanning()) {
                $setWaitingReason("Waiting for zcoind to rescan the block index. This may take a long time...");
                await $daemon.awaitBlockchainLoaded();
            }

            $setWaitingReason("Waiting for the API to indicate it's ready to receive commands...");
            await $daemon.awaitApiIsReady();

            $setWaitingReason("Connecting to zcoind...")
            await $daemon.awaitHasConnected();

            if (await $daemon.isWalletLocked()) {
                // Start up the daemon.

                $setWaitingReason("Loading our state from zcoind...");
                try {
                    // Make sure our state is updated before proceeding.
                    await $daemon.awaitInitializersCompleted();
                } catch (e) {
                    await $quitApp(`An error occurred in our initializers: ${e}`);
                }

                logger.info("zcoind has started.");
                $setWaitingReason(undefined);
                store.commit('App/setZcoindHasStarted', true);
                store.commit('App/setIsInitialized', true);
                resolve();
            } else {
                // Direct the user to the lock wallet screen. The lock wallet screen will call resolve() when it has
                // successfully started zcoind.

                router.push({
                    path: '/setup/lock-wallet',
                    query: {
                        isExistingWallet: true,
                        onStart: resolve
                    }
                }).then(() => {
                    $setWaitingReason(undefined);
                })
            }
        })
        .catch(async e => {
            await $quitApp(`An error occured starting zcoind: ${e}`);
        });
});

// currentRoute will only be set if we're being reloaded.
const currentRoute = store.getters['App/currentRoute'];

if (!currentRoute) {
    if (process.env.ZCOIN_CLIENT_REPL === 'true') {
        // Allow shutting down.
        $setWaitingReason(undefined);

        window.Zcoind = require('../daemon/zcoind').Zcoind;

        ourWindow.webContents.openDevTools();
    } else if (store.getters['App/isInitialized'] &&
               existsSync(store.getters['App/walletLocation']) &&
               process.env.REINITIALIZE_ZCOIN_CLIENT !== 'true') {
        startVue();
        ourWindow.show();
        $startDaemon().then(() => {
            router.push("/main");
        });
    } else {
        logger.info("App is not yet initialized. Let's get 'er ready!");

        $setWaitingReason(undefined);
        startVue();
        router.push("/setup/welcome").then(() => {
            ourWindow.show();
        });
    }
} else {
    // This branch is taken when we're reloaded.

    $setWaitingReason(undefined);

    startVue();
    ourWindow.show();

    // fixme: Sometimes, push() is necessary, and other times, it fails and is not. I don't really understand what is
    //        going on, but since this is only for development I haven't bothered with figuring out what's happening.
    const pushCurrentRoute = () => {
        if (router.currentRoute.path !== router.currentRoute.path) {
            router.push(currentRoute);
        }
    }

    if (!currentRoute.path.startsWith("/setup/")) {
        $startDaemon().then(() => {
            logger.info(`Navigating to route before reload: ${currentRoute.path}`);
            pushCurrentRoute();
        });
    } else {
        logger.info(`Navigating to route before reload: ${currentRoute.path}`);
        pushCurrentRoute();
    }
}
