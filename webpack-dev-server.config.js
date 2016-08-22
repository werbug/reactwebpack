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

/**
 * 需要构建项目的入口文件
 * 想对于当前目录
 */
//===========================================
var enterFile = 'src/redux_demo/index.jsx';
// var enterFile = 'src/8_oclock/app.jsx';
//===========================================

var config = {
    //总入口文件
    entry: {
        // polyfill: 'babel-polyfill',
        server: ['webpack/hot/dev-server', 'webpack/hot/only-dev-server'],
        app: path.join(__dirname, enterFile)
    },
    //入口文件配置解析类型
    resolve: {
        //默认打包文件
        root: path.resolve('src'),
        extensions: ["", ".js", ".jsx"],
        modulesDirectories: ['node_modules'] //(Default Settings)
        //node_modules: ["web_modules", "node_modules"]  (Default Settings)
    },
    //server 配置
    devServer: {
        contentBase: 'www', //发布目录
        devtool: 'eval',
        hot: true, //Live-reload
        inline: true,
        host: '0.0.0.0',
        port: 9080 //Port Number
    },
    devtool: 'eval',
    output: {
        path: buildPath, //输出根目录
        publicPath: '',     // 引用资源文件的base路径
        filename: './[name].js'  //输出文件名
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
        new ExtractTextPlugin(".[name].css")
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
            { 
                test: /\.jpe?g$|\.gif$|\.png$/i,
                loader: "url-loader?limit=8192&name=./[name].[ext]"
            },
            //外置样式打包
            {
                test: /\.css/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")
            },
            {
                test: /\.less$/,
                //?{browsers:['> 1%', last 2 version', 'Android >= 4.0']}
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader")
            },
            {
                //React-hot loader and
                test: /\.(js|jsx)$/,
                /*
                 * babel 设置query后就不用 .babelrc 文件了
                 */
                loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0'], //react-hot is like browser sync and babel loads jsx and es6-7
                include: [path.join(__dirname, '/src')],
                exclude: function (path) {
                    var isNpmModule = !!path.match(/node_modules/);
                    return isNpmModule;
                },
                /*
                exclude: [
                    nodeModulesPath
                ],
                */
            }
        ]
    },
    //eslint config 文件配置路径
    eslint: {
        configFile: '.eslintrc.json'
    }
};

module.exports = config;