var exec = require('child_process').exec;
var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({
    moduleName: 'kit:fs'
});
var Path = require('path');
var fs = require('fs');

module.exports = {
    cp: function(options, callback) {
        var src = options.src;
        var dest = options.dest;
        lib.fs.cpAsync(src, dest, callback);
    },
    rm: function(options, callback) {
        var path = options.path;
        try {
            lib.fs.rm(path);
            callback();
        } catch (e) {
            callback(e);
        }
    },
    mkdir: function(options, callback) {
        var path = options.path;
        lib.fs.mkdir(path);
        callback();
    },
    mv: function(options, callback) {
        var src = options.src;
        var dest = options.dest;
        lib.fs.mvAsync(src, dest, callback);
    },
    chmod: function(options, callback) {
        var path = options.path;
        var mode = options.mode;
        // fs.chmod(path, mode, callback);
        var cmd = 'chmod -R ' + mode + ' ' + path;
        console.log('cmd: ' + cmd);
        exec(cmd , function (error, stdout, stderr){
            callback(error);
        });
    }
};