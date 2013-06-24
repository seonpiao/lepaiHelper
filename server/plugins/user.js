var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');

var config = {
    tpl:'',
    data:{
        set:function(){},
        get:function(){}
    }
};

var User = {
    config:function(options){
        lib.object.extend(config,options);
    }
};

Plugins.reg('user',{
    run:function(){
        server.get('/user',function(req,res){
            res.send(lib.plugins.Mustache.render(config.tpl,{}));
        });
        server.all('/user/set',function(req,res){
            var username = req.query.username || req.body.username || req.cookies.QFEUN;
            var password = req.query.password || req.body.password;
            var redirect = req.query.redirect || req.body.redirect;
            var userData = {};
            userData[username] = {
                password:password
            };
            config.data.set(userData,function(err){
                if(err){
                    if(redirect){
                        res.redirect('/user');
                    }
                    else{
                        Result.sendError(res);
                    }
                }
                else{
                    if(redirect){
                        res.redirect('/');
                    }
                    else{
                        Result.sendOk(res);
                    }
                }
            });
        });
    }
});

module.exports = User;