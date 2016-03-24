/**
 * 生产环境发布方法
 */
'use strict';
var webpack = require('webpack');
var path = require('path');
var buildPath = path.resolve(__dirname, 'build');
//var buildPath = path.resolve(__dirname, '../../baby/static/admin/pregnancy/', 'reactnative');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {
    //要进行打包的入口文件
    entry: ['babel-polyfill', path.join(__dirname, '/src/app/app.jsx')],
    resolve: {
        //默认打包文件
        extensions: ["", ".js", ".jsx"],
        node_modules: ["web_modules", "node_modules"] //(Default Settings)
    },
    //Render source-map file for final build
    devtool: 'source-map',
    output: {
        path: buildPath, //输出路径
        filename: 'app.js' //输出的文件名
    },
    plugins: [
        //uglify
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                //supresses warnings, usually from module minification
                warnings: false
            }
        }),
        //只报出错误或警告，但不会终止编译，建议如果是开发环境可以把这一项去掉
        new webpack.NoErrorsPlugin(),
        //直接转移的文件(夹)，比如一些 css 文件和一些图片
        new TransferWebpackPlugin([
            {
                from: 'style'
            }
        ], path.resolve(__dirname, "src")),
        //输出 CSS 文件
        new ExtractTextPlugin("./module/[name].css")
    ],
    module: {
        //eslint 
        preLoaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                include: [path.resolve(__dirname, "src/app")],
                exclude: [nodeModulesPath]
            }
        ],
        loaders: [
            {
                test: /\.(js|jsx)$/, //All .js and .jsx files
                loaders: ['babel'], //react-hot is like browser sync and babel loads jsx and es6-7
                exclude: [nodeModulesPath]
            },
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
            //jsx
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            //图片内联
            //{test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //Eslint config
    eslint: {
        configFile: '.eslintrc.json' //Rules for eslint
    }
};

module.exports = config;