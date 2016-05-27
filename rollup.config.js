'use strict';

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import npm from 'rollup-plugin-npm';

export default {
    entry: 'src/8_oclock_js/app.js',
    format: 'cjs',
    external: [ 'react' ],
    dest: 'build/',
    plugins: [
        babel(),
        npm({
            jsnext: true,
            main: true
        }),
        commonjs({
            include: 'node_modules/**'
        })
    ]
};