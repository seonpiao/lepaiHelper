var fs = require('fs');
var os = require('os');
var util = require('util');
var path = require('path');
var exec = require('child_process').exec;
var ic = new lib.ic.InfoCenter({
    moduleName: 'SvnHookPreCommit'
});

var checkLocked = function(pathset, lockedFiles) {
    ic.log('lockedFiles:' + lockedFiles);
    if (lockedFiles.length > 0) {
        pathset = eval(pathset);
        for (var i = 0, len = pathset.length; i < len; i++) {
            var file = pathset[i];
            var name = path.normalize(file.substring(4));
            for (var j = 0, jlen = lockedFiles.length; j < jlen; j++) {
                if (lockedFiles[j]) {
                    var result = name.indexOf(lockedFiles[j]);
                    ic.log('name: ' + name + ', lockedFile: ' + lockedFiles[j]);
                    if (result === 0) {
                        return name + ' locked by svnHook ^^';
                    }
                }
            }
        }
    }
};

var checkLog = function(pathset, log) {
    //有3种情况，1、特权，2、不符合规范，3、符合规范
    ic.log('log: ' + log);
    var boss = 'boss';
    if (log.indexOf(boss) === 0) {
        pathset = eval(pathset);
        for (var i = 0, len = pathset.length; i < len; i++) {
            var file = pathset[i];
            var name = path.normalize(file.substring(4));
            var result = name.indexOf('RIA/projectsV2/qiyiV2');
            if (result > -1) {
                return {
                    code: 'A003'
                };
            }
        }
        return {
            code: 'A001'
        };
    } else if (log.length < 4) {
        var errMsg = '\nLog is too short!\n';
        return {
            code: 'A002',
            errMsg: errMsg
        };
    } else {
        return {
            code: 'A003'
        };
    }
};
var checkFiles = function(fileset) {
    var config = require('./config').config;

    fileset = JSON.parse(fileset);
    var fileErrMsg = '';

    for (var suffix in fileset) {
        var files = fileset[suffix];
        if (files.length > 0) {
            var handler = config[suffix];
            var syntaxCheck = require('./' + handler).syntaxCheck;
            var suffixErrStr = syntaxCheck(files);
            fileErrMsg += suffixErrStr;
        }
    }
    return fileErrMsg;
};

var handle = function(data, lockedFiles, callback) {
    ic.log('data: ' + util.inspect(data));
    // callback();
    var fileset = data.fileset;
    var log = data.log;
    var pathset = data.pathset;
    var errMsgs = '';
    var lockedStr = checkLocked(pathset, lockedFiles);

    if (lockedStr) {
        callback(lockedStr);
    } else {
        var logInfo = checkLog(pathset, log);
        if (logInfo.code === 'A001') {
            callback();
        } else {
            if (logInfo.code === 'A002') {
                errMsgs += logInfo.errMsg;
            }
            errMsgs += checkFiles(fileset);
            if (errMsgs.length > 1) {
                callback(errMsgs);
            } else {
                callback();
            }
        }
    }
};

exports.handle = handle;