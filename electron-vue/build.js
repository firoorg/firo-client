const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');
const compileWrapper = require('./compile-wrapper');

module.exports = Promise.all([mainConfig, rendererConfig].map((c) => {
    c.mode = 'production';
    return compileWrapper(c);
})).catch(() => {
    console.error('compilation failed; aborting...');
    // FIXME: Some hooks are added somewhere so that process.exit() doesn't actually work. This generates a nasty error
    //        message and core dump, but meh.
    process.abort();
});