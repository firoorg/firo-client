import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import Scrollable from '@/directives/scrollable'

import i18n from '#/lib/i18n'

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import { sync } from 'vuex-router-sync'

import BindScopedSlotsPlugin from '@/plugins/BindScopedSlotsPlugin'
import LogMixin from '@/mixins/LogMixin'

import App from './App'
import router from './router'
import store from '../store/renderer'

import { setupWindowRouter } from '~/utils/routerHelper'

const app = require('electron').remote.app

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
    locale: i18n.getLocale(app), // Default locale
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
Vue.use(BindScopedSlotsPlugin)
Vue.mixin(LogMixin)

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

    console.log('found', fileName, componentName)

    // Register component globally
    Vue.component(
        componentName,
        // Look for the component options on `.default`, which will
        // exist if the component was exported with `export default`,
        // otherwise fall back to module's root.
        componentConfig.default || componentConfig
    )
})

// sync router and store
sync(store, router, {
    moduleName: 'AppRouter'
})

setupWindowRouter({ store, router })

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    i18n: i18n.getModule(app),
    template: '<App/>'
}).$mount('#app')
