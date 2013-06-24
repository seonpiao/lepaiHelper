var modules = {};

var lib = require('../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'Modules'});

module.exports = {
    reg:function(name,module){
        if(modules[name]){
            throw new Error('模块[' + name + ']已被注册');
        }
        modules[name] = module;
    },
    init:function(){
        for(var name in modules){
            try{
                modules[name].init();
                ic.info('模块[' + name + ']加载完成');
            }
            catch(e){
                ic.error('模块[' + name + ']初始化失败');
                ic.error('Detail:' + e.message);
            }
        }
    }
};