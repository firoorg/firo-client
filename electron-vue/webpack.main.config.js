const path = require('path')
const { dependencies } = require('../package.json')

let mainConfig = {
    mode: 'development',
    devtool: false,

    entry: {
        main: path.join(__dirname, '../src/main/main.ts')
    },

    optimization: {
        minimize: process.env.NODE_ENV == 'production' && !process.env.FIRO_CLIENT_TEST
    },

    externals: Object.keys(dependencies),

    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?data=@use "./src/renderer/styles";']
            },
            {
                test: /\.sass$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
            },
            {
                test: /\.less$/,
                use: ['vue-style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.ya?ml$/,
                use: ['json-loader']
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
                        loaders: {
                            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                            scss: 'vue-style-loader!css-loader!sass-loader',
                            less: `vue-style-loader!css-loader!less-loader`
                        }
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                use: 'url-loader'
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name]--[folder].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use:  'url-loader'
            }
        ]
    },

    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },

    resolve: {
        modules: ['src', 'node_modules'].map(x => path.join(__dirname, '..', x)),
        extensions: ['.js', '.vue', '.json', '.css', '.scss', '.node', '.ts']
    },

    target: 'electron-main'
}
module.exports = mainConfig
