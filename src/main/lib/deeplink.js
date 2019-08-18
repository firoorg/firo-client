import { app } from 'electron'
import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:deeplink')

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

    // This is called when the user opens a zcoin:// URL.
    parseZcoinUrl (url) {
        logger.info('deeplink: %O', url);

        this.store.dispatch('App/gotLink', url);

        this.windowManager.focus('main')
    }
}
