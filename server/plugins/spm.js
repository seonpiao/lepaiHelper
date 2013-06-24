var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var spm = require('../kit/spm');
var InfoCenter = require('../kit/infoCenter');
var os = require('os');
var Path = require('path');
var fs = require('fs');

Plugins.reg('spm',{
    init:function(){
        server.get('/spm/combo',function(req,res,next){
            var path = req.query.path;
            var dest = req.query.dest;
            var down = req.query.down;
            var newName = req.query.newname || '';
            var removeSea = req.query.removesea;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Spm',user:user});
            if(down == 'true'){
                var tmpdir = Path.join(os.tmpDir(),'spm',user,Date.now());
                lib.fs.mkdir(tmpdir);
                spm.combo({path:path,dest:tmpdir},function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        var fileName = Path.basename(path);
                        var builtFilePath = Path.join(tmpdir,fileName);
                        if(removeSea == 'true'){
                            var builtFilePath = spm.removeSea(builtFilePath);
                        }
                        ic.info('Built file path : ' + builtFilePath);
                        var filesize = lib.fs.size(builtFilePath);
                        res.setHeader('Content-Disposition','attachment;filename=' + fileName);
                        res.setHeader('Content-Length',filesize);
                        res.setHeader('Content-Type','application/octet-stream');
                        var fileStream = fs.createReadStream(builtFilePath,{bufferSize:1024 * 1024});
                        fileStream.pipe(res,{end:true});
                    }
                });
            }
            else{
                lib.fs.mkdir(dest);
                spm.combo({path:path,dest:dest,newName:newName},function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        if(removeSea == 'true'){
                            var oldFilePath = Path.join(dest,newName || Path.basename(path));
                            var newFilePath = spm.removeSea(oldFilePath);
                            lib.fs.mvAsync(newFilePath,oldFilePath,function(err){
                                if(err){
                                    Result.sendError(res,{data:err + ''});
                                }
                                else{
                                    Result.sendOk(res);
                                }
                            });
                        }
                        else{
                            Result.sendOk(res);
                        }
                    }
                });
            }
        });
        server.get('/spm/compress',function(req,res,next){
            var path = req.query.path;
            var dest = req.query.dest;
            var down = req.query.down;
            var removeSea = req.query.removesea;
            var newName = req.query.newname || '';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Spm',user:user});
            if(down == 'true'){
                var tmpdir = Path.join(os.tmpDir(),'spm',user,Date.now());
                lib.fs.mkdir(tmpdir);
                spm.compress({path:path,dest:tmpdir},function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        var fileName = Path.basename(path);
                        var builtFilePath = Path.join(tmpdir,fileName);
                        if(removeSea == 'true'){
                            var builtFilePath = spm.removeSea(builtFilePath);
                        }
                        ic.info('Built file path : ' + builtFilePath);
                        var filesize = lib.fs.size(builtFilePath);
                        res.setHeader('Content-Disposition','attachment;filename=' + fileName);
                        res.setHeader('Content-Length',filesize);
                        res.setHeader('Content-Type','application/octet-stream');
                        var fileStream = fs.createReadStream(builtFilePath,{bufferSize:1024 * 1024});
                        fileStream.pipe(res,{end:true});
                    }
                });
            }
            else{
                lib.fs.mkdir(dest);
                spm.compress({path:path,dest:dest,newName:newName},function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        if(removeSea == 'true'){
                            var oldFilePath = Path.join(dest,newName || Path.basename(path));
                            var newFilePath = spm.removeSea(oldFilePath);
                            lib.fs.mvAsync(newFilePath,oldFilePath,function(err){
                                if(err){
                                    Result.sendError(res,{data:err + ''});
                                }
                                else{
                                    Result.sendOk(res);
                                }
                            });
                        }
                        else{
                            Result.sendOk(res);
                        }
                    }
                });
            }
        });
    }
});