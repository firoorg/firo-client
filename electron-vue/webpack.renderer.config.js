process.env.BABEL_ENV = 'renderer'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

// This is the list of node_modules that will be included in our webpack bundle
let whiteListedModules = [
    'vue',
    'vue-lottie',
    'vue-radial-progress'
]

let rendererConfig = {
    mode: 'development',
    devtool: 'cheap-module-source-map',

    entry: {
        renderer: path.join(__dirname, '../src/renderer/renderer.js')
    },

    externals: Object.keys(dependencies).filter(d => !whiteListedModules.includes(d)),

    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                enforce: 'pre',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?data=@import "./src/renderer/styles";']
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'val-loader',
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        extractCSS: process.env.NODE_ENV === 'production',
                        whitespace: 'condense',
                        loaders: {
                            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                            scss: 'vue-style-loader!css-loader!sass-loader',
                            less: `vue-style-loader!css-loader!less-loader`
                        }
                    }
                }
            },
            {
                test: /\.ttf$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                    }
                }
            },
            {
                test: /\.svg\.data$/,
                loader: 'url-loader',
                options: {
                    mimetype: 'image/svg+xml'
                }
            },
            {
                test: /\.svg$/,
                loader: 'vue-svg-loader',
                options: {
                    svgo: {
                        plugins: [
                            {removeDimensions: true},
                            {inlineStyles: {onlyMatchedOnce: false}}
                        ]
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
        new MiniCssExtractPlugin({filename: 'styles.css'}),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.ejs'),
            nodeModules: process.env.NODE_ENV === 'production' ? false : path.resolve(__dirname, '../node_modules')
        }),
        new webpack.HotModuleReplacementPlugin()
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
        extensions: ['.js', '.vue', '.json', '.css', '.scss', '.node', '.ts']
    },
    target: 'electron-renderer'
}

module.exports = rendererConfig
