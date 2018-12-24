import { clipboard } from 'electron'
import { containsZcoinUri, containsZcoinAddress } from '#/lib/zcoin'
import { sleep } from '#/lib/utils'

// import Vue from 'vue'
import types from '~/types'

let watcherId = null
let watcherIsRunning = false

let previousText = null
// let previousImage = clipboard.readImage()

const isDiffText = (str1, str2) => str1 && str2 && str1 !== str2
// const isDiffImage = (img1, img2) => !img2.isEmpty() && img1.toDataURL() !== img2.toDataURL()

export default {

    async checkClipboard ({ store, deeplink }) {
        const currentText = clipboard.readText()

        if (isDiffText(previousText, currentText)) {
            console.log('text changed', previousText)

            if (containsZcoinUri(previousText)) {
                deeplink.parseZcoinUrl(previousText)
                // store.dispatch(types.clipboard.SET_CLIPBOARD, previousText)
            } else {
                const prefixes = store.getters['Settings/b58Prefixes']
                const addresses = containsZcoinAddress(previousText, prefixes)

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

        this.checkClipboard({ store, deeplink })
        watcherIsRunning = true
    },

    unwatch () {
        watcherIsRunning = false
    }
}
