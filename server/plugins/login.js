var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var InfoCenter = require('../kit/infoCenter');

var onlineUsers = {};

process.on('message',function(msg){
    if(msg.type == 'login'){
        onlineUsers[msg.data.uid] = {
            username:msg.data.username
        }
    }
});

var config = {
    check:function(req,res,next){
        var username = req.cookies.QFEUN;
        var ic = new InfoCenter({moduleName:'Login',user:username});
        if(this.whiteList[req.path]){
            ic.log('Check login on [' + req.path + '] for [' + username + '] : true!');
            next();
        }
        else if(this.checkLogin(req)){
            ic.log('Check login on [' + req.path + '] for [' + username + '] : true!');
            next();
        }
        else{
            ic.log('Check login on [' + req.path + '] for [' + username + '] : false!');
            this.sendResult(req,res,next);
        }
    },
    checkLogin:function(req){
        var username = req.cookies.QFEUN;
        var uid = req.cookies.QFEUID;
        var ic = new InfoCenter({moduleName:'Login',user:username});
        ic.info('OnlineUsers : ' + JSON.stringify(onlineUsers) + ' | ' + req.path);
        ic.info('Check : ' + uid + ' | ' + username + ' | ' + req.path);
        if(username && uid){
            // if(onlineUsers[uid] && onlineUsers[uid].username == username){
                return true;
            // }
        }
        return false;
    },
    sendResult:function(req,res,next){
        var path = req.path;
        var result = config.failure[path];
        if(result){
            if(result.redirect){
                res.redirect(result.redirect);
            }
        }
        else{
            Result.sendError(res,{code:'A00010'});
        }
    },
    auth:function(username,password,callback){
        callback(true);
    },
    tpl:'',
    failure:{},
    whiteList:{
        '/favicon.ico':true,
        '/login':true,
        '/plugins/login':true,
        '/plugins/logout':true,
        '/svn/co':true,
        '/update':true
    },
    default:'/'
};

var Login = {
    config:function(options){
        lib.object.deepExtend(config,options);
    }
};

Plugins.reg('login',{
    init:function(){
        server.use(config.check.bind(config));
    },
    run:function(){
        server.get('/login',function(req,res,next){
            if(config.checkLogin(req)){
                res.redirect(config.default);
            }
            else{
                res.send(lib.plugins.Mustache.render(config.tpl,{}));
            }
        });
        server.all('/plugins/login',function(req,res){
            var username = req.query.username || (req.body && req.body.username);
            var password = req.query.password || (req.body && req.body.password);
            var redirect = req.query.redirect || (req.body && req.body.redirect);
            config.auth(username,password,function(passed){
                if(passed){
                    var expiresDate = new Date();
                    expiresDate.setFullYear(2020);
                    var uid = lib.crypto.md5(Date.now() + '');
                    onlineUsers[uid] = {
                        username:username
                    };
                    if(server.isCluster()){
                        process.send({
                            type:'login',
                            data:{
                                uid:uid,
                                username:username
                            }
                        });
                    }
                    res.cookie('QFEUID',uid,{expires: expiresDate,httpOnly: true,domain:'.qiyife.com'});
                    res.cookie('QFEUN',username,{expires: expiresDate,domain:'.qiyife.com'});
                    if(redirect){
                        res.redirect(redirect);
                    }
                    else{
                        Result.sendOk(res);
                    }
                }
                else{
                    if(redirect){
                        res.redirect(redirect);
                    }
                    else{
                        Result.sendError(res);
                    }
                }
            });
        });
        server.all('/plugins/logout',function(req,res){
            var redirect = req.query.redirect || (req.body && req.body.redirect);
            res.clearCookie('QFEUID',{domain:'.qiyife.com'});
            res.clearCookie('QFEUN',{domain:'.qiyife.com'});
            if(redirect){
                res.redirect(redirect);
            }
            else{
                Result.sendOk(res);
            }
        });
    }
});

module.exports = Login;