var express = require("express");
var ecstatic = require('ecstatic');
var server = express();
var Plugins = require('./plugins');
var Modules = require('./modules');
var lib = require('../lib/lib');
var cluster = require('cluster');
var cpunum = require('os').cpus().length;
var ic = new lib.ic.InfoCenter({moduleName:'Core'});
var enableCluster = false;

module.exports = {
    get:server.get.bind(server),
    post:server.post.bind(server),
    all:server.all.bind(server),
    use:server.use.bind(server),
    isCluster:function(){
        return enableCluster;
    },
    on:function(type,callback){
        type = 'core' + type;
        lib.event.customEvent.on(type,callback);
    },
    un:function(type,callback){
        type = 'core' + type;
        lib.event.customEvent.un(type,callback);
    },
    fire:function(param){
        param.type = 'core' + param.type;
        lib.event.customEvent.fire(param);
    },
    start:function(options){
        var port = options.port || 80;
        var root = options.root;
        var baseDir = options.baseDir || '/';
        var showDir = options.showDir || false;
        var autoIndex = options.autoIndex || false;

        enableCluster = !!options.enableCluster;
        var _this = this;
        if(enableCluster){
            if(cluster.isMaster){
                for(var i = 0; i < cpunum; i++){
                    var worker = cluster.fork();
                    (function(worker){
                        worker.on('message',function(msg){
                            lib.object.forEach(cluster.workers,function(worker){
                                worker.process.send(msg);
                            });
                        });
                    })(worker);
                }
                cluster.on('death',function(){
                    cluster.fork();
                });
            }
            else{
                server.use(express.bodyParser());
                server.use(express.cookieParser());
                Plugins.init();
                Modules.init();
                if(root){
                    server.use(ecstatic({
                        root:root,
                        baseDir:baseDir,
                        showDir:showDir,
                        autoIndex:autoIndex
                    }));
                }
                server.listen(port);
                ic.log('Workers listen at ' + port);
            }
        }
        else{
            server.use(express.bodyParser());
            server.use(express.cookieParser());
            Plugins.init();
            Modules.init();
            if(root){
                server.use(ecstatic({
                    root:root,
                    baseDir:baseDir,
                    showDir:showDir,
                    autoIndex:autoIndex
                }));
            }
            server.listen(port);
            ic.log('Listen at ' + port);
        }

    }
};