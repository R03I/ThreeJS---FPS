const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
      },
    ]
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@': src,
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: src
  },
  devServer: {
    static: src,
  },
}