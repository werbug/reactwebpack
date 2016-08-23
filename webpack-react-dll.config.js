/**
 * webpack.DllReferencePlugin 插件配置文件
 * 把 react react-dom 分享出去
 * 生成 [name]-manifest.json 文件放在 dist/dll 下，供 production 时使用
 */

'use strict';
const path = require('path'),
    webpack = require('webpack');

// dist 路径相关
const userRoot = path.resolve(__dirname, '../../'),
    buildPath = path.join('baby/static/lg/dist/', 'dll');

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
        // 将打包环境定为生产环境
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        
        // 去重插件
        new webpack.optimize.DedupePlugin(),

        // 
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
        
        //压缩
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                //supresses warnings, usually from module minification
                warnings: false
            }
        })
    ]
}
