/**
 * The file enables `@/lang/index.js` to import and parse all language.ya?ml files
 * in a one-shot manner. There should not be any reason to edit this file.
 */

// FIXME: Undo this when translations are updated.
// const files = require.context('.', false, /\.ya?ml/)
const files = require.context('.', false, /en.yaml$/)

const modules = {}

files.keys().forEach(key => {
    if (key === './index.js') return

    modules[key.replace(/(\.\/|\.ya?ml)/g, '')] = files(key)
})

export default modules
