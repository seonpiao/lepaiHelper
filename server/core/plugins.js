var plugins = {};

var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'Plugins'});

module.exports = {
    reg:function(name,plugin){
        if(plugins[name]){
            throw new Error('插件[' + name + ']已被注册');
        }
        plugins[name] = plugin;
    },
    get:function(){
        return plugins;
    },
    init:function(){
        for(var name in plugins){
            try{
                if(plugins[name].init)plugins[name].init();
                ic.info('插件[' + name + ']初始化完成');
            }
            catch(e){
                ic.error('插件[' + name + ']初始化失败');
                ic.error('Detail:' + e.message);
            }
        }
        for(var name in plugins){
            try{
                if(plugins[name].run)plugins[name].run();
                ic.info('插件[' + name + ']执行完成');
            }
            catch(e){
                ic.error('插件[' + name + ']执行失败');
                ic.error('Detail:' + e.message);
            }
        }
    }
};