#!/usr/bin/env node

/**
 * After prepare, files are copied to the platforms/ios and platforms/android folders.
 * Lets clean up some of those files that arent needed with this hook.
 */
var fs = require('fs');
var path = require('path');

var deleteFolderRecursive = function(removePath) {
    if (fs.existsSync(removePath)) {
        fs.readdirSync(removePath).forEach(function(file, index) {
            var curPath = path.join(removePath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(removePath);
    }
};

var otherDirs = [
    'www/templates',
    'www/lib/localforage/site',
    'www/lib/localforage/src',
    'www/lib/moment/benchmarks',
    'www/lib/moment/meteor',
    'www/lib/moment/locale',
    'www/lib/moment/scripts',
    'www/lib/ng-notify/src',
    'www/lib/ngInflection/test',
    'www/lib/socket.io-client/lib',
    'www/lib/socket.io-client/support',
    'www/lib/socket.io-client/test',
];

otherDirs.forEach(function(src) {
    deleteFolderRecursive(path.resolve(__dirname, '../../platforms/ios/' + src));
    deleteFolderRecursive(path.resolve(__dirname, '../../platforms/android/assets/' + src));
});
