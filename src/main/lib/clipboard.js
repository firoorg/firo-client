import { clipboard } from 'electron'

// import Vue from 'vue'
// import * as types from '../types/Mint'

let watcherId = null
let previousText = clipboard.readText()
// let previousImage = clipboard.readImage()

const isDiffText = (str1, str2) => str2 && str1 !== str2
// const isDiffImage = (img1, img2) => !img2.isEmpty() && img1.toDataURL() !== img2.toDataURL()

export default {
    containsZcoinUri (text) {
        const zcoinUri = new RegExp('(zcoin://)([a-zA-Z0-9_])(:[0-9]+)?(/.*)?')

        console.log(zcoinUri.test(text))

        return zcoinUri.test(text)
    },

    watch (store) {
        if (watcherId) {
            return
        }
        watcherId = setInterval(() => {
            if (isDiffText(previousText, previousText = clipboard.readText())) {
                console.log('text changed', previousText)

                if (this.containsZcoinUri(previousText)) {
                    store.dispatch('Clipboard/setClipboard', previousText)
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
