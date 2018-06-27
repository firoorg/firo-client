import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'
import VueI18n from 'vue-i18n'

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

import BindScopedSlotsPlugin from '@/plugins/BindScopedSlotsPlugin'

import App from './App'
import router from './router'
import store from '../store/renderer'

const customValidationRules = [
    'isZcoinAddress'
]

Vue.use(VTooltip)

Vue.use(VueTimeago, {
    name: 'Timeago', // Component name, `Timeago` by default
    locale: undefined, // Default locale
    locales: {
        // 'zh-CN': require('date-fns/locale/zh_cn'),
        'en': require('date-fns/locale/en')
    }
})

customValidationRules.forEach((rule) => {
    require('./utils/validationRules/' + rule)
})

Vue.use(VeeValidate, {
    errorBagName: 'validationErrors',
    fieldsBagName: 'validationFields'
})

Vue.use(BindScopedSlotsPlugin)

Vue.use(VueI18n)

const messages = {
    en: {
        hello: 'World {count}'
    }
}

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages // set locale messages
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// automatically registering BaseComponents as Component (stripping of Base)
const requireComponent = require.context(
    // The relative path of the components folder
    './components',
    // Whether or not to look in subfolders
    true,
    // The regular expression used to match base component filenames
    /Base[A-Z]\w+\.(vue|js)$/
)

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

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    i18n,
    template: '<App/>'
}).$mount('#app')
