var fs = require('fs');
var vm = require('vm');
var path = require('path');

var dirpath = __dirname + '/';
recure(dirpath,function(basePath,fileName){
    var realPath = path.join(basePath,fileName);
    var stat = fs.statSync(realPath);
    if(stat.isFile() && path.extname(realPath) == '.js' && path.basename(realPath) != 'sea.js'){
        var code = fs.readFileSync(realPath).toString();
        if(code.match(/^\s*define/)){
            vm.runInNewContext(code,{define:function(fn){
                var code = fn.toString().replace(/(^function\s*\([^\)]*\)\s*{)|(}\s*$)/g,'').replace(/^    /gm,'');
                fs.writeFileSync(realPath,code);
            }});
        }
    }
},function(){
    console.log('ok');
});

function recure(path,fn,callback){
    var _this = this;
    var files = fs.readdirSync(path);
    for(var i = 0, len = files.length; i < len; i++){
        var filename = files[i];
        stats = fs.statSync(path + filename);
        if(stats.isFile()){
            fn(path,filename);
        }
        else if(stats.isDirectory()){
            if(filename.charAt(0) === '.') continue;
            var newpath = fn(path,filename) || (path + filename);
            recure(newpath + '/',fn);
        }
    }
    if(callback)callback();
}
