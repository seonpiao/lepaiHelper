var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'kit:zip'});
var Path = require('path');
var fs = require('fs');

var watchedList = {};

module.exports = {

    watch:function(path /*options,callback*/){
        var options = {
            recursive:true
        },callback;
        var _this = this;
        if(arguments.length == 2){
            callback = arguments[1];
        }
        else if(arguments.length == 3){
            lib.object.extend(options,arguments[1]);
            callback = arguments[2];
        }
        if(options.recursive){
            lib.fs.recure(path,function(dir,filename){
                var fullpath = Path.join(dir,filename);
                if(lib.fs.isFile(fullpath)){
                    _this._watch(Path.join(dir,filename),callback);
                }
            });
        }
        else{
            this._watch(path,callback);
        }
    },
    _watch:function(path,callback){
        watchedList[path] = callback;
        // console.log('Watching ' + path);
        fs.watchFile(path,{interval:1000},function(curr,prev){
            callback(path);
        });
    }
};