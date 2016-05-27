/**
 * 生产环境发布方法
 */
'use strict';
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
/**
 * 路径组装
 * 先说一下情况，此 webpack 构建可支持最新的 ES6/7 + reactjs
 * 确定一个入口文件后，进行完整的依赖打包：
 * 1. 将所有依赖 js 打在一起
 * 2. css/less 文件没有打进 js，个人实用感受，这样很有维护性，否则 js 文件很乱
 * 3. 所需的图片先进行压缩，再将小于8k的图片转成 base64 写入 css，大于8k的文件放入 baby-img 库
 */

//获取入口文件
var argv = process.argv,
    index = argv.indexOf('--path');

if (index === -1 || !argv[index + 1]) {
    console.log('缺少入口文件，请检查执行命令');
    return;
}

var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var projectName = argv[index + 1],
    projectPathArr = projectName.split('/');

console.log(projectName);

//用户的 git 根目录，这样做是因为图片和 JS/CSS 不在一个库，输出路径上只能妥协成这样了
var userRoot = path.resolve(__dirname, '../../'),
    buildPath = path.join('baby/static/lg/dist/', projectPathArr[0]),
    imgPath = path.join('baby-img/img/lg/dist/', projectPathArr[0]);        //还没有用上

var config = {
    /*
     * 要进行打包的入口文件
     * 如果是要强力增强兼容性，比如要在低版本桌面浏览器上用，就加上'babel-polyfill'，把整个babel环境都打进去
     */
    entry: {
        app: path.join(__dirname, '/src', projectName),
        react: ['react', 'react-dom'],
        router: ['react-router']
    },
    resolve: {
        //默认打包文件
        extensions: ["", ".js", ".jsx"],
        modulesDirectories: ['node_modules'] //(Default Settings)
    },
    /*
     * Render source-map file for final build
     */
    //devtool: 'source-map',
    output: {
        path: path.join(userRoot, buildPath), //输出路径
        publicPath: '',     //src 的 base 路径
        filename: './[name].js' //输出的文件名
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
                }
            }),

        /*
         * 将公共模块分享出去
         */
        new webpack.optimize.CommonsChunkPlugin({
            name: ['react','router'],
            minChunks: Infinity
        }),
        
        /*
         * 压缩
         */
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                //supresses warnings, usually from module minification
                warnings: false
            }
        }),
        
        //只报出错误或警告，但不会终止编译，建议如果是开发环境可以把这一项去掉
        new webpack.NoErrorsPlugin(),
        //输出 CSS 文件
        new ExtractTextPlugin('./[name].css')
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
            //"file-loader?name=img/[hash:8].[name].[ext]",
            //压缩图片，不过这个压缩很慢，先不加了"!img-loader?minimize",
            { 
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "url-loader?limit=8192&name=./[name].[ext]"
            },
            //内联样式
            /*
            { test: /\.css$/, loader: 'style-loader!css-loader!autoprefixer-loader' },
            { test: /\.less$/, loader: 'style-loader!css-loader!autoprefixer-loader!less-loader' },
            */
            //外置样式打包
            {
                test: /\.css/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader?{browsers:['> 1%', 'Android >= 4.0']}")
            },
            {
                test: /\.less$/,
                //?{browsers:['> 1%', 'last 2 version', 'Android >= 4.0']}
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader?{browsers:['> 1%', 'Android >= 4.0']}!less-loader")
            },
            /**
             * js/jsx 编译
             * @query 编译参数，这里配置后，不再需要.babelrc文件
             *      presets:
             *          es2015 ES6
             *          stage-0 ES7
             *          react JSX
             */
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                include: [path.join(__dirname, '/src')],
                exclude: [
                    nodeModulesPath
                ],
                query: {
                    // plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0', 'react']
                }
            }
        ]
    },
    /*
     * img-loader
     * img-loader?minimize 对应的压缩参数
     */
    imagemin: {
        gifsicle: { interlaced: false },
        jpegtran: {
            progressive: true,
            arithmetic: false
        },
        optipng: { optimizationLevel: 7 },
        pngquant: {
            floyd: 0.5,
            speed: 2
        },
        svgo: {
            plugins: [
                { removeTitle: true },
                { convertPathData: false }
            ]
        }
    },
    //Eslint config
    eslint: {
        configFile: '.eslintrc.json' //Rules for eslint
    }
};

module.exports = config;
