import { clipboard } from 'electron'
import { containsZcoinUri, containsZcoinAddress } from '#/lib/zcoin'

// import Vue from 'vue'
// import * as types from '../types/Mint'

let watcherId = null
let previousText = clipboard.readText()
// let previousImage = clipboard.readImage()

const isDiffText = (str1, str2) => str2 && str1 !== str2
// const isDiffImage = (img1, img2) => !img2.isEmpty() && img1.toDataURL() !== img2.toDataURL()

export default {
    watch (store) {
        if (watcherId) {
            return
        }
        watcherId = setInterval(() => {
            if (isDiffText(previousText, previousText = clipboard.readText())) {
                console.log('text changed', previousText)

                if (containsZcoinUri(previousText)) {
                    store.dispatch('Clipboard/setClipboard', previousText)
                } else {
                    const prefixes = store.getters['Settings/b58Prefixes']
                    const addresses = containsZcoinAddress(previousText, prefixes)

                    if (addresses && addresses.length === 1) {
                        store.dispatch('Clipboard/setClipboard', addresses[0])
                    }
                }
            }

            /*
            if (isDiffImage(previousImage, previousImage = clipboard.readImage())) {
                console.log('image changed')
            }
            */
        }, 500)
    }
}
