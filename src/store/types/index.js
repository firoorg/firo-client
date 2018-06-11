/**
 * The file enables you to import all vuex mutation types
 * in a one-shot manner. There should not be any reason to edit this file.
 * mutation types are namespaced by default. import each module individually if you don't need them
 */

const files = require.context('.', false, /\.js$/)
const types = {}

files.keys().forEach(key => {
    if (key === './index.js') return
    const file = files(key)
    const namespace = key.replace(/(\.\/|\.js)/g, '')
    const nsTypes = {}
    Object.keys(file).forEach((key) => {
        nsTypes[key] = `${namespace}/${file[key]}`
    })

    types[namespace.toLowerCase()] = nsTypes
})

export default types
