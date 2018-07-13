import Debug from 'debug'
import { app } from 'electron'
import urlParse from 'url-parse'
import { isZcoinAddress } from '#/lib/zcoin'
import types from '~/types'

const debug = Debug('zcoin:deeplink')

export default {
    windowManager: null,
    store: null,

    init ({ windowManager, store }) {
        this.windowManager = windowManager
        this.store = store

        const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.

            // Protocol handler for win32
            // argv: An array of the second instance’s (command line / deep linked) arguments
            if (process.platform === 'win32') {
                // Keep only command line / deep linked arguments
                const deeplinkingUrl = argv.slice(1)

                this.onOpenUrl(deeplinkingUrl)
            }
        })

        if (shouldQuit) {
            app.quit()
            return
        }

        app.on('open-url', (event, url) => {
            event.preventDefault()

            this.parseZcoinUrl(url)
        })
    },

    parseZcoinUrl (url) {
        const parsed = urlParse(url, true)
        const prefixes = this.store.getters['Settings/b58Prefixes']

        const [ address ] = url.match(RegExp(parsed.hostname, 'i'))

        debug('got deeplink url', url, address, parsed)

        // got a payment request url
        if (address && isZcoinAddress(address, prefixes)) {
            debug('is payment request. filling store...')
            this.store.dispatch(types.clipboard.SET_CLIPBOARD, url)
            this.store.dispatch(types.clipboard.SET_ADDRESS, address)

            const { amount, message } = parsed.query

            if (amount) {
                this.store.dispatch(types.clipboard.SET_AMOUNT, amount)
            }

            if (message) {
                this.store.dispatch(types.clipboard.SET_MESSAGE, message)
            }
        }

        this.windowManager.focus('main')
    }
}
