import { clipboard } from 'electron'
import { containsZcoinUri, containsZcoinAddress } from '#/lib/zcoin'
import { sleep } from '#/lib/utils'
import { createLogger } from '#/lib/logger'

// import Vue from 'vue'
import types from '~/types'

const logger = createLogger('zcoin:clipboard')

let watcherId = null
let watcherIsRunning = false

let previousText = null
// let previousImage = clipboard.readImage()

export default {
    async checkClipboard ({ store, deeplink }) {
        const currentText = clipboard.readText()

        if (currentText && (currentText !== previousText)) {
            logger.debug("got new clipboard: %O", currentText)
            if (containsZcoinUri(currentText)) {
                deeplink.parseZcoinUrl(currentText)
                // store.dispatch(types.clipboard.SET_CLIPBOARD, previousText)
            } else {
                const prefixes = store.getters['Settings/b58Prefixes']
                const addresses = containsZcoinAddress(currentText, prefixes)

                if (addresses && addresses.length === 1) {
                    store.dispatch(types.clipboard.SET_CLIPBOARD, addresses[0])
                }
            }
        }

        previousText = currentText

        await sleep(500)

        if (watcherIsRunning) {
            setImmediate(() => {
                this.checkClipboard({ store, deeplink })
            })
        }
    },

    watch ({ store, deeplink }) {
        if (watcherIsRunning) {
            return
        }

        watcherIsRunning = true
        logger.info("beginning to watch clipboard")
        this.checkClipboard({ store, deeplink })
    },

    unwatch () {
        watcherIsRunning = false
    }
}
