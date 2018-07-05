import { app } from 'electron'

export default {
    windowManager: null,

    init ({ windowManager }) {
        this.windowManager = windowManager

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
            // event.preventDefault()

            // this.onOpenUrl(url)
        })
    },

    onOpenUrl (url) {
        console.log('app.makeSingleInstance# ' + url)

        this.windowManager.focus('main')
    }
}
