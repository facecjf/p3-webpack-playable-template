// const path = require('path');
// const webpack = require("webpack");
// // const HtmlWebpackPlugin = require("html-webpack-plugin");

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     path: path.resolve(__dirname, 'build'),
//     publicPath: '/build/',
//     filename: 'playable.js',
//     clean: true
// },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env'],
//           }
//         }
//       },
//       {
//         test: /\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json$)$/i,
//         type: 'asset/inline'
//       },
//     ]
//   },
//   plugins: [
//     new webpack.DefinePlugin({
//       CANVAS_RENDERER: JSON.stringify(true),
//       WEBGL_RENDERER: JSON.stringify(true)
//     })
//     // ,
//     // new HtmlWebpackPlugin({
//     //   template: "./src/index.html"
//     // }),
//   ]
// };
