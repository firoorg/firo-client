const electron = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

async function startRenderer () {
    rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);
    rendererConfig.mode = 'development';

    const compiler = webpack(rendererConfig);
    const server = new WebpackDevServer(
        compiler,
        {
            contentBase: path.join(__dirname, '../'),
            hot: true
        }
    )

    server.listen(9080)
}

async function startMain () {
    mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main);
    mainConfig.mode = 'development';

    webpack(mainConfig);
}

function startElectron () {
    const electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')])

    electronProcess.on('close', () => {
        process.exit()
    })
}

function init () {
    Promise.all([startRenderer(), startMain()])
        .then(() => {
            startElectron()
        })
        .catch(err => {
            console.error(err)
        })
}

init()