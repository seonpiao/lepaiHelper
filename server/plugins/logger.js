var server = require('../core/core');
var Plugins = require('../core/plugins');
var lib = require('../lib/lib');

var config = {
    file:'',
    format:'{{ip}} [{{time}} {{#user}}by {{user}}{{/user}}] {{method}} "{{{path}}}" "{{{referer}}}" "{{{ua}}}"\r\n',
    fields:{}
}

var Logger = {
    config:function(options){
        lib.object.extend(config,options);
    }
}

Plugins.reg('logger',{
    init:function(){
        server.use(function(req, res, next){
            var data = {
                ip:req.ip,
                time:lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss'),
                method:req.method,
                path:req.path,
                referer:req.get('Referer'),
                ua:req.get('User-Agent')
            };
            lib.object.forEach(config.fields,function(item,name){
                if(typeof item == 'function'){
                    data[name] = item(req);
                }
                else{
                    data[name] = item;
                }
            });
            var log = lib.plugins.Mustache.render(config.format,data);
            if(config.file){
                lib.fs.appendAsync(config.file,log);
            }
            else{
                console.log(log);
            }
            next();
        });
    }
});

module.exports = Logger;