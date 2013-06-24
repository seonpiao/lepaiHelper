var server = require('../../core/core');
var Plugins = require('../../core/plugins');
var Result = require('../../core/result');
var lib = require('../../lib/lib');
var Svn = require('../../kit/svn');
var fs = require('fs');
var os = require('os');
var util = require('util');
var path = require('path');
var exec = require('child_process').exec;
var ic = new lib.ic.InfoCenter({moduleName:'SvnHook'});

var lockedPath = path.join(__dirname, 'locked');
var lockedString = lib.fs.readFile(lockedPath);
var lockedFiles = [];
if (lockedString !== '') {
    lockedFiles = lockedString.split('|');
}

Plugins.reg('svnhook',{
    init:function(){
        ic.log('svnhook init');
        server.all('/post_commit',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('post_commit');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });

        server.all('/post_lock',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('post_lock');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });

        server.all('/post_unlock',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('post_unlock');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });
        server.all('/post_revprop_change',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('post_revprop_change');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });
        server.all('/pre_commit', function(req, res, next) {
            ic.log('pre_commit');
            var locked = lib.fs.readFile(lockedPath);
            var callback = function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            };
            var data = req.body;
            var handle = require('./preCommit').handle;
            handle(data, lockedFiles, callback);
        });

        server.all('/pre_commit/lock', function(req, res, next) {
            var dir = req.query.path;
            dir = path.normalize(dir + path.sep);
            ic.log('lock: ' + dir);
            if (lockedFiles.indexOf(dir) === -1){
                lockedFiles.push(dir);
                lib.fs.writeFile(lockedPath, lockedFiles.join('|'));
            }
            Result.sendOk(res);
        });

        server.all('/pre_commit/unlock', function(req, res, next) {
            var dir = req.query.path;
            dir = path.normalize(dir + path.sep);
            ic.log('unlock: ' + dir);
            ic.log('lockedFiles: ' + lockedFiles);
            var index = lockedFiles.indexOf(dir);
            ic.log('index: ' + index);
            if (index > -1) {
                lockedFiles.splice(index, 1);
            }
            ic.log('lockedFiles: ' + lockedFiles);
            var lockedStr = lockedFiles.join('|');
            lib.fs.writeFile(lockedPath, lockedStr);
            Result.sendOk(res);
        });

        server.all('/pre_lock',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('pre_lock');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });

        server.all('/pre_revprop_change',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('pre_revprop_change');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });

        server.all('/pre_unlock',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('pre_unlock');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });

        server.all('/start_commit',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var err = false;
            ic.log('start_commit');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            if(err){
                ic.error(err);
                Result.sendError(res,{data:err + ''});
            }
            else{
                Result.sendOk(res);
            }
        });
    }
});