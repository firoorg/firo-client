import { clipboard } from 'electron'
import { containsZcoinUri, containsZcoinAddress } from '#/lib/zcoin'

// import Vue from 'vue'
import types from '~/types'

let watcherId = null
let previousText = clipboard.readText()
// let previousImage = clipboard.readImage()

const isDiffText = (str1, str2) => str2 && str1 !== str2
// const isDiffImage = (img1, img2) => !img2.isEmpty() && img1.toDataURL() !== img2.toDataURL()

export default {
    watch ({ store, deeplink }) {
        if (watcherId) {
            return
        }
        watcherId = setInterval(() => {
            if (isDiffText(previousText, previousText = clipboard.readText())) {
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

            /*
            if (isDiffImage(previousImage, previousImage = clipboard.readImage())) {
                console.log('image changed')
            }
            */
        }, 500)
    }
}
