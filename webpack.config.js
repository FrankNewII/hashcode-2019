const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        port: 9001
    },
    plugins: [
        new CopyPlugin([
            { from: 'src/index.html', to: 'dest/index.html' }
        ])
    ]
};
