const webpack = require('webpack');

module.exports = function (config) {
    return new Promise((resolve, reject) => {
        console.info(`compiling ${config.target}....`);

        let compiler = webpack(config, (err, stats) => {
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
                reject(errors);
            } else {
                console.info(`${config.target} module built successfully...`);
                resolve(compiler);
            }
        })
    });
}