/**
 * The file enables you to import all vuex mutation types
 * in a one-shot manner. There should not be any reason to edit this file.
 * mutation types are namespaced by default. import each module individually if you don't need them
 */

import { isObject } from 'lodash'

const files = require.context('.', false, /\.js$/)
const types = {}

files.keys().forEach(key => {
    if (key === './index.js') return
    const file = files(key)
    const namespace = key.replace(/(\.\/|\.js)/g, '')

    let nsTypes = {}

    const addKeys = (obj) => {
        Object.keys(obj).forEach((key) => {
            if (key === 'default' && isObject(obj[key])) {
                addKeys(obj[key])
            } else {
                nsTypes[key] = `${namespace}/${obj[key]}`
            }
        })
    }

    addKeys(file)

    types[namespace.toLowerCase()] = nsTypes
})

export default types
