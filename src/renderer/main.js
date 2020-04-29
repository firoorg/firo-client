import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import Scrollable from '@/directives/scrollable'
import Focus from '@/directives/focus'

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

import {existsSync} from 'fs';

import i18n from '#/lib/i18n'

const electron = require('electron');
const remote = electron.remote;
const app = electron.remote.app;

import BindScopedSlotsPlugin from '@/plugins/BindScopedSlotsPlugin'
import Logger from '@/plugins/Logger'

import App from './App'
import router from './router'
import store from '../store/renderer'

import zcoind from '../daemon/init'

import {convertToCoin} from "#/lib/convert";

import { createLogger } from '#/lib/logger';
const logger = createLogger('zcoin:renderer:main.js');

logger.info("Entering renderer/main.js...");

let ourWindow = remote.getCurrentWindow();

const customValidationRules = [
    'isZcoinAddress',
    'notExceedingBalance'
]

customValidationRules.forEach((rule) => {
    require('./utils/validationRules/' + rule)
})

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
requireComponent.keys().forEach(fileName => {
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
})

// Allow global access to the store.
window.$store = store;

// Show the waiting screen with reason, or, if reason may be undefined, close it.
//
// Note that the app starts off with the reason "Loading..." in order to not show the main window for a short time
// before starting the daemon.
function setWaitingReason(reason) {
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
        alert(message);
    }

    // $daemon will not be set if we are setting up.
    if (window.$daemon) {
        setWaitingReason("Shutting down zcoind...");
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

    // Execution may momentarily resume, so wait forever to avoid giving control back to the caller awaiting us.
    await new Promise(r=>undefined);
}

// This event is fired from the main/index.js. It will prevent the default event, so we are responsible for closing the
// process now.
ourWindow.webContents.on('shutdown-requested', async () => {
    if ($store.getters['App/waitingReason']) {
        logger.warn("Ignoring shutdown attempt in a critical period.");
        return;
    }

    await $quitApp();
});

// Handle zcoin:// links on Windows.
app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    const amount = m(/[\?&]amount=([0-9]+)/);
    const label = m(/[\?&]message=([^&]+)/);

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

if (store.getters['App/isInitialized'] && existsSync(store.getters['App/walletLocation'])) {
    setWaitingReason("Starting up zcoind...");

    startVue();
    ourWindow.show();

    // Start up zcoind.
    zcoind(store, store.getters['App/zcoinClientNetwork'], store.getters['App/zcoindLocation'], store.getters['App/blockchainLocation'] || null)
        .then(async z => {
            // Make $daemon globally accessible.
            window.$daemon = z;

            setWaitingReason("Loading our state from zcoind...");

            try {
                // Make sure our state is updated before proceeding.
                await $daemon.awaitInitializersCompleted();
            } catch(e) {
                await $quitApp(`An error occurred in our initializers: ${e}`);
            }

            if (!$daemon.isWalletLocked())  {
                await $quitApp("Zcoin Client doesn't support the use of unencrypted wallets. Please lock your wallet manually and try again.");
            }

            setWaitingReason(undefined);
        })
        .catch(async e => {
            await $quitApp(`An error occured starting zcoind: ${e}`);
        });
} else {
    setWaitingReason(undefined);

    logger.info("App is not yet initialized. Let's get 'er ready!");

    store.commit('App/setIsInitialized', false);

    startVue();
    ourWindow.show();
}