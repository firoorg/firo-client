const path = require('path')
const { dependencies } = require('../package.json')

const {VueLoaderPlugin} = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

let rendererConfig = {
    mode: 'development',
    devtool: false,

    entry: {
        renderer: path.join(__dirname, '../src/renderer/renderer.ts')
    },

    optimization: {
        minimize: process.env.NODE_ENV == 'production' && !process.env.FIRO_CLIENT_TEST
    },

    externals: Object.keys(dependencies),

    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.s[ac]ss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.css$/,
                use: 'css-loader'
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/]
                    }
                }
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource'
            },
            {
                test: /\.svg\.data$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        mimetype: 'image/svg+xml'
                    }
                }
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.ejs'),
            nodeModules: process.env.NODE_ENV === 'production' ? false : path.resolve(__dirname, '../node_modules')
        })
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'fonts': path.resolve(__dirname, '..', 'assets', 'fonts')
        },
        modules: ['src', 'node_modules'].map(x => path.join(__dirname, '..', x)),
        extensions: ['.js', '.vue', '.json', '.css', '.scss', '.node', '.ts'],
        plugins: [
            new TsconfigPathsPlugin()
        ]
    },
    target: 'electron-renderer'
}

module.exports = rendererConfig
