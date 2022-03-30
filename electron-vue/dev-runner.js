const electron = require('electron');
const path = require('path');
const child_process = require('child_process');
const compileWrapper = require('./compile-wrapper');
const WebpackDevServer = require('webpack-dev-server');

const rendererConfig = require('./webpack.renderer.config');
//rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);
const mainConfig = require('./webpack.main.config');

(async () => {
    await compileWrapper(mainConfig);
    const rendererCompiler = await compileWrapper(rendererConfig);

    const server = new WebpackDevServer(
        rendererCompiler,
        {
            contentBase: path.join(__dirname, '..', 'dist', 'electron'),
            hot: true
        }
    );
    server.listen(9080);

    const electronProcess = child_process.spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')]);
    electronProcess.stdout.on('data', (data) => {
        console.log(data.toString().replace(/\n$/, ''));
    });
    electronProcess.stderr.on('data', (data) => {
        console.log(data.toString().replace(/\n$/, ''));
    });
    electronProcess.on('exit', () => process.exit());
})();