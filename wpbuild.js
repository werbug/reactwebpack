'use strict';
let childProcess = require('child_process'),
    argv = process.argv;
    
let pathArr = [],
    isWatch = false;

if (argv[2] && argv[2].indexOf('--') === 0) {
    let destApp = argv[2].replace('--', '');
    pathArr = destApp.split(':');
    if (pathArr.length === 1 || !pathArr[1]) {
        pathArr[1] = 'app.jsx';
    }
} else {
    console.log('please input the project\'s name ant main app.js')
    return;
}

if (argv[3] && argv[3] === '--watch') {
    isWatch = true;
}

let execCommand = 'webpack --config webpack-production.config.js --progress --colors'
                    + (isWatch ? ' --watch' : '')
                    + ' --path ' + pathArr.join('/');
                    
let params = execCommand.split(' ');
params.shift(0);

console.log(params);                    

let cmd_process = childProcess.spawn('webpack', params);

cmd_process.stdout.on('data', (data) => {
    console.log(data);
});
// cmd_process.stderr.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
cmd_process.on('close', (data) => {
    console.log(`child process exited with code ${code}`);
});