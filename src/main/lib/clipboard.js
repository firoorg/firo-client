import { clipboard } from 'electron'
import { sleep } from '#/lib/utils'

// We should only be run once.
let watcherIsRunning = false

export default {
    async _watchLoop (store) {
        let clipboardText = ''

        while (true) {
            const latestText = clipboard.readText()

            if (clipboardText !== latestText) {
                store.commit("Clipboard/setClipboard", latestText)
                clipboardText = latestText
            }

            await sleep(500)
        }
    },

    // This function will throw an error if it has been called previously.
    watch (store) {
        if (watcherIsRunning) {
            throw "clipboard.watch() should only be called once"
        } else {
            watcherIsRunning = true
        }

        this._watchLoop(store)
    }
}
