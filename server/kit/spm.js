var exec = require('child_process').exec;
var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'kit:spm'});
var Path = require('path');
var Build = require('spm').Build;
var fs = require('fs');
var vm = require('vm');

module.exports = {
    combo:function(options,callback){
        options.beautify = true;
        this.__build(options,callback);
    },
    compress:function(options,callback){
        options.beautify = false;
        this.__build(options,callback);
    },
    removeSea:function(filepath){
        var jsMaps = {};
        var numFlag = 0;
        var define = function(flag,require,fn){
            var numVar = '__' + (numFlag++);
            flag = Path.join('c',flag);
            var req = null;
            fn = fn.toString();
            var params = fn.toString().match(/\(\s*(\w*)\s*,\s*\w*\s*,\s*(\w*)\s*\)/);
            var exp = params[2];
            var inc = params[1];
            fn = fn.toString().replace(/\(\s*\w*\s*,\s*\w*\s*,\s*(\w*)\s*\)/,'($1)');
            fn = fn.replace(new RegExp(exp + '\\.exports\\s*=\\s*'),exp + '.' + numVar + '=');
            if(require.length){
                req = require.map(function(i){
                    var normalize = Path.join(Path.join(flag,'..'),i);
                    fn = fn.replace(new RegExp(inc + '\\([\"\']' + i + '[\"\']\\)',"g"),function(){return '--' + normalize + '--';});
                    return normalize;
                });
            }
            jsMaps[flag] = {
                numFlag:numVar,
                flag:flag,
                req:req,
                fn:fn,
                inc:inc,
                exp:exp
            };
        };
        var file = lib.fs.readFile(filepath) + '';
        vm.runInNewContext(file,{define:define});

        //根据依赖性排序
        var entReq;
        var list = {};
        for(var i in jsMaps){
            entReq = i;
            break;
        }
        var findReq = function(need){
            var self = arguments.callee;
            if(jsMaps[need].req){
                jsMaps[need].req.forEach(function(item){
                    self(item);
                });
            }
            if(!list[need]){
                list[need]=jsMaps[need].numFlag;
            }
        };
        findReq(entReq);

        var fnArrs = Object.keys(list).map(function(flag){
            var req;
            var fn = jsMaps[flag].fn;
            if(jsMaps[flag].req){
                req = jsMaps[flag].req.map(function(r){
                    fn = fn.replace(new RegExp('--' + r.replace(/\\/g,"\\\\") + '--',"g"),function(){return jsMaps[flag].exp + '.' + jsMaps[r].numFlag;});
                    return jsMaps[r].numFlag;
                });
            }
            return {
                req:req,
                fn:fn
            };
        });

        var proStrs = [];
        fnArrs.forEach(function(item){
            proStrs.push(['(',item.fn,')(_qc);'].join(''));
        });
        var destFilePath = Path.dirname(filepath);
        var destFileName = Path.basename(filepath) + '_withoutsea' + Path.extname(filepath);
        var destFullFilePath = Path.join(destFilePath,destFileName);
        lib.fs.writeFile(destFullFilePath,'(function(global){var _qc={};global.Qiyi=global.Qiyi||{};' + proStrs.join('') + '})(this);');
        return destFullFilePath;
    },
    __build:function(options,callback){
        var path = options.path;
        var dest = options.dest;
        var newName = options.newName || '';
        var beautify = options.beautify;
        var args = path + ' --combine_all --output ' + dest;
        if(beautify){
            args += ' --combine_only';
        }
        var build = new Build(args);
        try{
            build.run();
            if(newName){
                var oldName = Path.basename(path);
                fs.rename(Path.join(dest,oldName), Path.join(dest,newName),function(err){
                    if(err){
                        ic.error(e.stack);
                    }
                    callback(err);
                });
            }
            else{
                callback();
            }
        }
        catch(e){
            ic.error(e.stack);
            callback(e);
        }
    }
};