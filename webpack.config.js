const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const src = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: src,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/textures', to: 'textures' },
        { from: 'src/maps', to: 'models' },
        { from: 'src/index.html', to: 'index.html' }
      ]
    })
  ]
}