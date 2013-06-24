var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var Svn = require('../kit/svn');
var Path = require('path');
var InfoCenter = require('../kit/infoCenter');

Plugins.reg('svn',{
    init:function(){
        server.get('/svn/cp',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn copy from ' + src + ' to ' + dest);
            Svn.cp({src:src,dest:dest,message:message},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });

        server.get('/svn/ps',function(req,res,next){
            var pname = req.query.pname;
            var pvalue = req.query.pvalue;
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn propset pname ' + pname + ' to ' + pvalue);
            Svn.ps({pname:pname,pvalue:pvalue,path:path},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });

        server.get('/svn/pd',function(req,res,next){
            var pname = req.query.pname;
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            Svn.pd({pname:pname,path:path},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });

        server.get('/svn/pg',function(req,res,next){
            var pname = req.query.pname;
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            Svn.pg({pname:pname,path:path},function(err,data){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:data});
                }
            });
        });

        server.get('/svn/co',function(req,res,next){
            var url = req.query.url;
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn checkout ' + url + ' to ' + path);
            Svn.co({url:url,path:path},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });

        server.get('/svn/branch',function(req,res,next){
            var url = req.query.url;
            var name = req.query.name;
            var message = req.query.message;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn branch for ' + url);
            Svn.branch({url:url,name:name,message:message},function(err,data){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:data});
                }
            });
        });

        server.get('/svn/tag',function(req,res,next){
            var url = req.query.url;
            var name = req.query.name;
            var user = req.cookies.QFEUN;
            var message = req.query.message;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn tag for ' + url);
            Svn.tag({url:url,name:name,message:message},function(err,data){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:data});
                }
            });
        });

        server.get('/svn/export',function(req,res,next){
            var url = req.query.url;
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn export ' + url + ' to ' + path);
            Svn.export({url:url,path:path},function(err){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });

        server.get('/svn/diff',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn diff from ' + src + ' to ' + dest);
            Svn.diff({src:src,dest:dest},function(err,list){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:list});
                }
            });
        });

        server.get('/svn/list',function(req,res,next){
            var url = req.query.url;
            var count = req.query.count;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            ic.log('Svn list ' + url + ' limit ' + count);
            Svn.list({url:url,count:count},function(err,list){
                if(err){
                    ic.error(err);
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:list});
                }
            });
        });

        server.get('/svn/add',function(req,res,next){
            var localPath = req.query.path;
            var url = req.query.url;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Svn',user:user});
            var svnTempDir = Path.join(__dirname,'__svntemp' + new Date().getTime());
            ic.log('Svn add ' + svnTempDir + ' to ' + url);
            Svn.mkdir({url:url},function(err){
                Svn.co({path:svnTempDir,url:url},function(err){
                    if(err){
                        ic.error(err);
                        Result.sendError(res,{data:err});
                    }
                    else{
                        /*lib.fs.recure(svnTempDir + '/',function(filepath,filename){
                            var dirpath = path.join(filepath,filename);
                            lib.fs.rm(svnTempDir);
                        });*/
                        lib.fs.cpAsync(localPath,svnTempDir,function(err){
                            if(err){
                                ic.error(err);
                                Result.sendError(res,{data:err});
                            }
                            else{
                                Svn.add({path:svnTempDir + '/*'},function(err){
                                    if(err){
                                        ic.error(err);
                                        Result.sendError(res,{data:err});
                                    }
                                    else{
                                        Svn.ci({path:svnTempDir},function(err){
                                            try{
                                                lib.fs.rm(svnTempDir);
                                            }
                                            catch(error){
                                                ic.log(error);
                                            }
                                            Result.sendOk(res);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }
});