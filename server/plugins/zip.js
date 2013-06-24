var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var Zip = require('../kit/zip');
var InfoCenter = require('../kit/infoCenter');

Plugins.reg('zip',{
    init:function(){
        server.get('/zip/zip',function(req,res,next){
            var path = req.query.path;
            var dest = req.query.dest;
            var name = req.query.name;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Zip',user:user});
            ic.log('Zip ' + path + ' to ' + dest + '/' + name + '.zip');
            Zip.zip({path:path,dest:dest,name:name},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });
    }
});