var server = require('../core/core');
var Plugins = require('../core/plugins');
var lib = require('../lib/lib');

Plugins.reg('cors',{
    init:function(){
        server.use(function(req, res, next){
            var origin = req.get('Origin');
            res.set({
                'Access-Control-Allow-Credentials':'true',
                'Access-Control-Allow-Origin':origin
            });
            next();
        });
    }
});