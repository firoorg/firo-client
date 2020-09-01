const webpack = require('webpack');

const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

const promises = [];

for (const config of [mainConfig, rendererConfig]) {
    config.mode = 'production';

    console.info(`building ${config.target} module...`);

    promises.push(new Promise((resolve, reject) => webpack(config, (err, stats) => {
        const errors = [...(err ? [err] : []), ...stats.compilation.errors, ...stats.compilation.warnings];

        if (errors.length > 1) {
            console.error(`${config.target} failed to build:`);
            for (const e of errors) {
                console.error(e);
                console.error("Error properties:");
                for (const prop of Object.getOwnPropertyNames(e)) {
                    console.error(`\t${prop}: ${e[prop]}`);

                    if (typeof e[prop] === 'object') {
                        for (const p of Object.getOwnPropertyNames(e[prop])) {
                            console.error(`\t\t${p}: ${e[prop][p]}`);
                        }
                    }
                }
            }
            reject();
        } else {
            console.info(`${config.target} module built successfully...`);
            resolve();
        }
    })));
}

Promise.all(promises).catch(() => {
    console.error('compilation failed; aborting...');
    // FIXME: Some hooks are added somewhere so that process.exit() doesn't actually work. This generates a nasty error
    //        message and core dump, but meh.
    process.abort();
});