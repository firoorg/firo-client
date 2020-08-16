const electron = require('electron');
const path = require('path');
const child_process = require('child_process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const rendererConfig = require('./webpack.renderer.config');

rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);
rendererConfig.mode = 'development';

const compiler = webpack(rendererConfig);
const server = new WebpackDevServer(
    compiler,
    {
        contentBase: path.join(__dirname, '../'),
        hot: true
    }
);
server.listen(9080);

const electronProcess = child_process.spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')]);
electronProcess.on('exit', () => process.exit());
