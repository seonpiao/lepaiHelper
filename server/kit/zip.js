var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'kit:zip'});
var zip = require('node-native-zip');
var Path = require('path');

module.exports = {
    zip:function(options,callback){
        var path = options.path;
        var dest = options.dest;
        var name = options.name || lib.date.format(new Date(),'yyyyMMddHHmmss');
        try{
            var archive = new zip();
            var files = [];
            ic.info('Zipping [' + path + ']');
            lib.fs.recure(path,function(filepath,filename){
                var relPath = Path.relative(path,filepath);
                filepath = Path.join(filepath,filename).replace(/\\/g,'/');
                relPath = Path.join(relPath,filename).replace(/\\/g,'/');
                files.push({name:relPath,path:filepath});
            });
            archive.addFiles(files,function(){
                var buff = archive.toBuffer();
                lib.fs.writeFile(Path.join(dest,name + '.zip'),buff);
                callback();
            })
        }
        catch(e){
            ic.error(e);
            callback(e);
        }
    }
};