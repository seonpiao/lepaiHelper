var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var InfoCenter = require('../kit/infoCenter');

var config = {
    privileges:{
        '/':{
            deny:{
                usergroups:[],
                users:[]
            }
        }
    },
    usergroups:{
        developer:[]
    },
    failure:{
        '/':{
            response:'没有权限'
        }
    }
};

var isGroup = function(user,groupName){
    if(config.usergroups[groupName] && config.usergroups[groupName].indexOf(user) != -1){
        return true;
    }
    return false;
};

var check = function(req,res,next){
    var path = req.path;
    var user = req.cookies.QFEUN;
    var ic = new InfoCenter({moduleName:'Privilege',user:user});
    var privilegeList = config.privileges[path];
    ic.info('PrivilegeList : ' + JSON.stringify(privilegeList));
    if(privilegeList){
        if(privilegeList.deny){
            if(privilegeList.deny.users.indexOf(user) != -1){
                ic.info('Check privilege on [' + path + '] for [' + user + '] : deny!');
                return sendResult(req,res,next);
            }
            else{
                var groups = privilegeList.deny.usergroups;
                if(groups){
                    for(var i = 0; i < groups.length; i++){
                        ic.info('Checking deny group : ' + groups[i])
                        if(isGroup(user,groups[i])){
                            ic.info('Check privilege on [' + path + '] for [' + user + '] : deny!');
                            return sendResult(req,res,next);
                        }
                    }
                }
                ic.info('Check privilege on [' + path + '] for [' + user + '] : pass!');
                next();
            }
        }
        else if(privilegeList.pass){
            if(privilegeList.pass.users && privilegeList.pass.users.indexOf(user) != -1){
                ic.info('Check privilege on [' + path + '] for [' + user + '] : pass!');
                next();
            }
            else{
                var groups = privilegeList.pass.usergroups;
                if(groups){
                    for(var i = 0; i < groups.length; i++){
                        ic.info('Checking pass group : ' + groups[i])
                        if(isGroup(user,groups[i])){
                            ic.info('Check privilege on [' + path + '] for [' + user + '] : pass!');
                            return next();
                        }
                    }
                }
                ic.info('Check privilege on [' + path + '] for [' + user + '] : deny!');
                return sendResult(req,res,next);
            }
        }
        else{
            ic.info('Check privilege on [' + path + '] for [' + user + '] : pass!');
            next();
        }
    }
    else{
        ic.info('Check privilege on [' + path + '] for [' + user + '] : pass!');
        next();
    }
};

var sendResult = function(req,res,next){
    var path = req.path;
    var result = config.failure[path];
    if(result){
        Result.send(res,result);
    }
    else{
        Result.sendError(res,{code:'A00011'});
    }
};

var Privilege = {
    config:function(options){
        lib.object.deepExtend(config,options);
    }
};

Plugins.reg('privilege',{
    init:function(){
        server.use(check);
    }
});

module.exports = Privilege;