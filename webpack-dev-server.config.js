/**
 * 开发环境 dev-server 构建方法
 */
'use strict';

var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve(__dirname, 'build');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {
    //总入口文件
    entry: [
        'babel-polyfill',
        'webpack/hot/dev-server',
        'webpack/hot/only-dev-server',
        path.join(__dirname, '/src/app/app.jsx')
    ],
    //入口文件配置解析类型
    resolve: {
        extensions: ["", ".js", ".jsx"]
            //node_modules: ["web_modules", "node_modules"]  (Default Settings)
    },
    //server 配置
    devServer: {
        contentBase: 'www', //发布目录
        devtool: 'eval',
        hot: true, //Live-reload
        inline: true,
        port: 8080 //Port Number
    },
    devtool: 'eval',
    output: {
        path: buildPath, //输出根目录
        filename: 'app.js'  //输出文件名
    },
    plugins: [
        //Enables Hot Modules Replacement
        new webpack.HotModuleReplacementPlugin(),
        //Allows error warnings but does not stop compiling. Will remove when eslint is added
        new webpack.NoErrorsPlugin(),
        //移动文件，如果发布目录和编辑目录不一致时，可以配置此项将编辑的 www 内容文件转移到发布目录
        /*
        new TransferWebpackPlugin([
            {
                from: 'www'
            }
        ], path.resolve(__dirname, "")),
        */
        //输出 CSS 文件
        new ExtractTextPlugin("app.css")
    ],
    module: {
        //构建前置加载器
        preLoaders: [
            {
                //Eslint loader
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                include: [path.resolve(__dirname, "src/app")],
                exclude: [nodeModulesPath]
            }
        ],
        loaders: [
            //内联样式
            //{test: /\.css$/, loader: 'style!css'},
            //{ test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
            //外置样式打包
            {
                test: /\.css/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
            {
                //React-hot loader and
                test: /\.(js|jsx)$/, //All .js and .jsx files
                loaders: ['react-hot', 'babel'], //react-hot is like browser sync and babel loads jsx and es6-7
                exclude: [nodeModulesPath]
            }
        ]
    },
    //eslint config 文件配置路径
    eslint: {
        configFile: '.eslintrc.json'
    }
};

module.exports = config;