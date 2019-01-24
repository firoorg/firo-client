/**
 * The file enables `@/config/index.js` to import all config modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

const files = require.context('.', false, /\.js$/)
const config = {}

files.keys().forEach(key => {
    if (key === './index.js') return
    config[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export default config
