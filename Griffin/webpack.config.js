const HtmlWebpackPlugin = require("html-webpack-plugin");

= {
    entry: './src/',
    output: {
        path: __dirname + '/dist',
        filename: ''
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/'
        })
    ],
    mode: 'development'
};