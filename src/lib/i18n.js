import Vue from 'vue'
import VueI18n from 'vue-i18n'

import types from '~/types'
import languages from '#/lang'
import dateTimeFormats from '#/lang/dateTimeFormats'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:i18n')

let i18nInstance = null

export function setupLocales ({ store }) {
    logger.info('setting up languages')

    //const fallback = (process.env.LOCALE || app.getLocale()).substr(0, 2)
    const locales = Object.keys(languages).reduce((accumulator, key) => {
        if (!languages[key].meta) {
            return accumulator
        }

        const { name, flag } = languages[key].meta

        return {
            ...accumulator,
            [key]: {
                key,
                flag,
                name,
                label: `${flag} ${name}`
            }
        }
    }, {})

    store.dispatch(types.settings.SET_AVAILABLE_LOCALES, locales)
}

export function getLocale ({ app, store }) {
    const fallbackLocale = (process.env.LOCALE || app.getLocale()).substr(0, 2)
    const currentLocale = store.getters['Settings/currentLocaleKey']

    if (!currentLocale) {
        store.dispatch(types.settings.SET_LOCALE, fallbackLocale)
    }

    logger.info('current locale: %s falling back to: %s', currentLocale, fallbackLocale)

    return currentLocale
}

export function getModule ({ app, store, onLocaleChange }) {
    if (i18nInstance) {
        return i18nInstance
    }

    Vue.use(VueI18n)

    store.subscribe((mutation, state) => {
        if (mutation.type !== types.settings.SET_LOCALE) {
            return
        }

        i18nInstance.locale = mutation.payload

        if (onLocaleChange) {
            onLocaleChange()
        }
    })

    const locale = getLocale({ app, store })

    const i18n = new VueI18n({
        dateTimeFormats,
        locale,
        fallbackLocale: 'en',
        messages: languages // set locale messages
    })

    if (process.env.SHOW_TRANSLATIONS) {
        logger.info('switching to translation mode')
        const interpolate = i18n._formatter.interpolate

        i18n._formatter.interpolate = function (message, values) {
            const result = interpolate.bind(i18n._formatter)(message, values)
            return result.map((r) => `${r} ✅`)
        }
    }

    i18nInstance = i18n

    return i18nInstance
}

export default {
    setupLocales,
    getLocale,
    getModule
}
