 const electron = require('electron');
const path = require('path');
const child_process = require('child_process');
const compileWrapper = require('./compile-wrapper');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../webpack.config');
config.entry.renderer = [path.join(__dirname, 'dev-client')].concat(config.entry.renderer);

(async () => {
    const compiler = await compileWrapper(config);

    const server = new WebpackDevServer(
        {
            static: path.join(__dirname, '..', 'dist', 'electron'),
            hot: true,
            port: 9080
        },
        compiler
    );
    await server.start();

    const electronProcess = child_process.spawn(process.env.NPX_PATH || 'npx', ['electron', '--inspect=5858', path.join(__dirname, '../dist/electron/main.js')]);
    electronProcess.stdout.on('data', (data) => {
        console.info(data.toString().replace(/\n$/, ''));
    });
    electronProcess.stderr.on('data', (data) => {
        console.error(data.toString().replace(/\n$/, ''));
    });
    electronProcess.on('exit', () => process.exit());
})();