const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: "playable.js",
    path: path.resolve(__dirname, 'dist/'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|xml$)$/i,
        type: 'asset/inline'
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    // Disable for .js only file Build
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
  ]
};
