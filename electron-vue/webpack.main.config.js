const path = require('path')
const { dependencies } = require('../package.json')

let mainConfig = {
    entry: {
        main: path.join(__dirname, '../src/main/main.js')
    },

    externals: Object.keys(dependencies),

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
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.ya?ml$/,
                use: ['json-loader', 'yaml-loader']
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
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'imgs/[name]--[folder].[ext]'
                    }
                }
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
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'fonts/[name]--[folder].[ext]'
                    }
                }
            },
            {
                test: /\.svg$/,
                loader: 'vue-svg-loader', // `vue-svg` for webpack 1.x
                options: {
                    // optional [svgo](https://github.com/svg/svgo) options
                    svgo: {
                        plugins: [
                            {removeDoctype: true},
                            {removeComments: true},
                            {removeViewBox: false},
                            {removeDimensions: true},
                            {removeXMLNS: true}
                        ]
                    }
                }
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
