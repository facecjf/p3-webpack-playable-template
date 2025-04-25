
const path = require('path');
const webpack = require('webpack');
const CustomHtmlWebpackPlugin = require('./CustomHtmlWebpackPlugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: "playable.js",
        path: path.resolve(__dirname, 'dist', 'HPM_p_PullThePin_ZG_EN_2503_Fix12_adcolony'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|xml)$/i,
                type: 'asset/inline'
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.AD_NETWORK': JSON.stringify('adcolony')
        }),
        new CustomHtmlWebpackPlugin({
            template: 'C:\\Users\\cfarina\\Desktop\\devPlayables\\PhaserEditor_Playables\\02_PhaserTemplates\\p3-webpack-playable-template\\src\\index\\adcolony\\index.html',
            filename: 'index.html'
        }),
    ]
};
