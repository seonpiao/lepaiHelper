var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var Svn = require('../kit/svn');
var ic = new lib.ic.InfoCenter({moduleName:'SvnHook'});

Plugins.reg('svnhook',{
    init:function(){
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

        server.all('/pre_commit',function(req,res,next){
            var src = req.query.src;
            var dest = req.query.dest;
            var message = req.query.message;
            ic.log('pre_commit');
            var arg = (req.body.arg || '').split('|-_-|');
            ic.log(arg);
            Svn.look({cmd:'log',params:['-t',arg[1],arg[0]]},function(obj){
                if(obj.err){
                    ic.error(obj.err);
                    Result.sendError(res,{data:obj.err + ''});
                }
                else if(obj.stderr){
                    ic.error(obj.stderr);
                    Result.sendError(res,{data:obj.stderr + ''});
                }
                else{
                    if(obj.stdout.trim().length > 0){
                        Result.sendOk(res);
                    }
                    else{
                        Result.sendError(res,{data:'Empty log message not allowed. Commit aborted!'});
                    }
                }
            });
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