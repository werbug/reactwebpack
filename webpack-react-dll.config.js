const path = require('path');
const webpack = require('webpack');

//
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

console.log('将 react 核心包打进项目: ' + projectName);

//用户的 git 根目录，这样做是因为图片和 JS/CSS 不在一个库，输出路径上只能妥协成这样了
var userRoot = path.resolve(__dirname, '../../'),
    buildPath = path.join('baby/static/lg/dist/', projectPathArr[0]);

/**
 *
 */
module.exports = {
    entry: {
        verdor: ['react', 'react-dom']
    },
    output: {
        path: path.join(userRoot, buildPath), //输出路径
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    plugins: [
        /*
         * 将打包环境定为生产环境
         */
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        
        new webpack.DllPlugin({
            /*
             * path  
             * 定义 manifest 文件生成的位置
             * [name] 的部分由 entry 的名字替换
             */
            path: path.join(userRoot, buildPath, '[name]-manifest.json'),
            /*
             * name
             * dll bundle 输出到哪个全局变更上
             * 和 output.library 一样即可
             */
            name: '[name]_library'
        }),
        /*
         * 压缩
         */
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                //supresses warnings, usually from module minification
                warnings: false
            }
        })
    ]
}
