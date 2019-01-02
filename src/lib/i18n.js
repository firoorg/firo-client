import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Debug from 'debug'

import languages from '#/lang'
import dateTimeFormats from '#/lang/dateTimeFormats'

const debug = Debug('zcoin:i18n')

export function getLocale (app) {
    const locale = (process.env.LOCALE || app.getLocale()).substr(0, 2)

    console.log('locale --> ', locale)
    debug('current locale: %s', locale)

    return locale
}

export function getModule (app) {
    Vue.use(VueI18n)

    const locale = getLocale(app)

    const i18n = new VueI18n({
        dateTimeFormats,
        locale,
        fallbackLocale: process.env.NODE_ENV !== 'production' ? 'structure' : 'en',
        messages: languages // set locale messages
    })

    if (process.env.SHOW_TRANSLATIONS) {
        debug('switching to translation mode')
        const interpolate = i18n._formatter.interpolate

        i18n._formatter.interpolate = function (message, values) {
            const result = interpolate.bind(i18n._formatter)(message, values)
            return result.map((r) => `${r} ✅`)
        }
    }

    return i18n
}

export default {
    getLocale,
    getModule
}
