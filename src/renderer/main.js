import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import Scrollable from '@/directives/scrollable'
import Focus from '@/directives/focus'

import i18n from '#/lib/i18n'

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import { sync } from 'vuex-router-sync'

import BindScopedSlotsPlugin from '@/plugins/BindScopedSlotsPlugin'
import Logger from '@/plugins/Logger'

import App from './App'
import router from './router'
import store from '../store/renderer'

import zcoind from '../daemon/init'

const electron = require('electron');
const remote = electron.remote;
const app = electron.remote.app;

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

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
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

// Allow users to access the store from Chrome Dev Tools.
window.$store = store;

/// Start up zcoind.
zcoind(store)
    .then(z => {
        // Make zcoind accessible to Vue instances as $daemon.
        Vue.prototype.$daemon = z;
        // Allow users to access $daemon from Chrome Dev Tools.
        window.$daemon = z;

        // Stop zcoind when the user exits the client.
        app.once('quit', async () => {
            await z.stopDaemon();
        });

        // Start the GUI.
        new Vue({
            components: {App},
            router,
            store,
            i18n: i18n.getModule({app, store}),
            template: '<App/>'
        }).$mount('#app');

        ourWindow.show();
    })
    .catch(e => {
        alert(e);
        app.exit(-1);
    });