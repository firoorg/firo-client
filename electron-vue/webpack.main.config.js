'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.js')
  },

  externals: Object.keys(dependencies),

  module: {
    rules: [
      {
        test: /\.(js)$/,
        enforce: 'pre',
        exclude: /node_modules/
      },

      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
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
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },

  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },

  resolve: {
    alias: {
      '~': path.join(__dirname, '../src/store'),
      '#': path.join(__dirname, '../src')
    },

    extensions: ['.js', '.json', '.node', '.ts']
  },

  target: 'electron-main'
}

if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig
