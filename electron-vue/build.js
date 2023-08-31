const config = require('../webpack.config');
const compileWrapper = require('./compile-wrapper');

(async () => {
    try {
        config.mode = 'production';
        return compileWrapper(config);
    } catch (e) {
        console.error('compilation failed; aborting...');
        console.error(e);
        // FIXME: Some hooks are added somewhere so that process.exit() doesn't actually work. This generates a nasty error
        //        message and core dump, but meh.
        process.abort();
    }
})();