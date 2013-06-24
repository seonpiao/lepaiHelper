var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var InfoCenter = require('../kit/infoCenter');
var Path = require('path');

var config = {
    /**
     * {
            projects:[
                {
                    id:'',
                    name:'',
                    planstart:'',
                    planend:'',
                    start:'',
                    end:'',
                    lastupdate:'',
                    developers:[],
                    state:'', // working,done,pause,delay,idle
                    modules:[
                        {
                            id:'',
                            name:'',
                            planstart:'',
                            planend:'',
                            start:'',
                            end:'',
                            lastupdate:'',
                            developers:'',
                            state:'' // working,done,pause,delay,idle
                        }
                    ]
                }
            ],
            developers:{
                'piaoshihuang':{
                    projects:[]
                }
            }
        }
     * @type {[type]}
     */
    data:null,
    tmpl:null
};

var PM = {
    config:function(options){
        lib.object.deepExtend(config,options);
    }
};

function findProjectById(data,id){
    var pdata = null;
    data.projects.forEach(function(project){
        if(project.id == id){
            pdata = project;
        }
    });
    return pdata;
}

function findProjectByMid(data,mid){
    var pdata = null;
    data.projects.forEach(function(project){
        project.modules.forEach(function(module){
            if(module.id == mid){
                pdata = project;
            }
        });
    });
    return pdata;
}

function findModuleByMid(data,mid){
    var mdata = null;
    data.projects.forEach(function(project){
        project.modules.forEach(function(module){
            if(module.id == mid){
                mdata = module;
            }
        });
    });
    return mdata;
}

Plugins.reg('pm',{
    init:function(){
        server.get('/pm',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var tmpl = config.indextmpl();
            res.send(tmpl);
        });
        server.get('/pm/projects',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var data = config.data();
            var type = req.query.type;
            var tmp = {};
            lib.object.deepExtend(tmp,data);
            tmp.projects.forEach(function(project){
                if(project.state != 'done'){
                    project.done = false;
                    if(project.state == 'working'){
                        project.working = true;
                    }
                    else if(project.state == 'pause'){
                        project.working = false;
                    }
                }
                else{
                    project.done = true;
                }
            });
            if(type == 'json'){
                res.send(JSON.stringify({code:'A00000',data:tmp}));
            }
            else{
                tmp.manage = true;
                var tmpl = config.prjstmpl();
                res.send(lib.plugins.Mustache.render(tmpl,tmp));
            }
        });
        server.get('/pm/manage',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var tmpl = config.mantmpl();
            res.send(lib.plugins.Mustache.render(tmpl,{}));
        });
        server.get('/pm/manage/addproject',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var id = Date.now().toString(36);
            var name = req.query.name;
            var planstart = req.query.planstart;
            var planend = req.query.planend;
            var now = new Date();
            var lastupdate = lib.date.format(now,'yyyy-MM-dd HH:mm:ss');
            var developers = [];
            var state = 'idle';
            var history = [{
                date:lastupdate,
                msg:'初始化项目'
            }];
            var modules = [];
            var data = config.data();
            data.projects.push({
                id:id,
                name:name,
                planstart:planstart,
                planend:planend,
                lastupdate:lastupdate,
                state:state,
                developers:developers,
                history:history,
                modules:modules
            });
            config.data(data);
            res.redirect('/pm/projects');
        });
        server.get('/pm/manage/rmproject',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var id = req.query.id;
            var data = config.data();
            data.projects.some(function(project,index){
                if(project.id == id){
                    data.projects.splice(index,1);
                }
            });
            config.data(data);
            res.redirect('/pm/projects');
        });
        server.get('/pm/manage/chprjstate',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var id = req.query.id;
            var state = req.query.state;
            var data = config.data();
            data.projects.some(function(project,index){
                if(project.id == id){
                    project.state = state;
                }
            });
            config.data(data);
            res.redirect('/pm/projects');
        });
        server.get('/pm/developers',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var data = config.data();
            var type = req.query.type;
            var renderData = {developers:[]};
            for (var developer in data.developers){
                var developerData = {name:developer,modules:[]};
                var modules = data.developers[developer].modules;
                modules.forEach(function(moduleInfo){
                    var pdata = findProjectByMid(data,moduleInfo.id);
                    var mdata = findModuleByMid(data,moduleInfo.id);
                    developerData.modules.push({
                        project:pdata,
                        module:mdata
                    });
                });
                renderData.developers.push(developerData);
            }
            if(type == 'json'){
                res.send(JSON.stringify({code:'A00000',data:renderData}));
            }
            else{
                var tmpl = config.userstmpl();
                res.send(lib.plugins.Mustache.render(tmpl,renderData));
            }
        });
        server.get('/pm/manage/addmodule',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var id = Date.now().toString(36);
            var projectId = req.query.projectid;
            var name = req.query.name;
            var planstart = req.query.planstart;
            var planend = req.query.planend;
            var now = new Date();
            var lastupdate = lib.date.format(now,'yyyy-MM-dd HH:mm:ss');
            var developers = '';
            var state = 'idle';
            var history = [{
                date:lastupdate,
                msg:'初始化模块'
            }];
            var data = config.data();
            var pdata = findProjectById(data,projectId);
            var modules = pdata.modules;
            modules.push({
                id:id,
                name:name,
                planstart:planstart,
                planend:planend,
                lastupdate:lastupdate,
                state:state,
                developers:developers,
                history:history
            });
            config.data(data);
            res.send(JSON.stringify({code:'A00000'}));
        });
        server.get('/pm/manage/rmmodule',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var id = req.query.id;
            var data = config.data();
            var pdata = findProjectByMid(data,id);
            var modules = pdata.modules;
            modules.some(function(module,index){
                if(module.id == id){
                    modules.splice(index,1);
                    return true;
                }
            });
            config.data(data);
            res.send(JSON.stringify({code:'A00000'}));
        });
        server.get('/pm/developer/:name',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var name = req.params.name;
            var data = config.data();
            var userInfo = data.developers[name];
            if(userInfo){
                var renderData = {modules:[]};
                userInfo.modules.forEach(function(moduleInfo){
                    data.projects.forEach(function(project){
                        project.modules.forEach(function(module){
                            if(module.id == moduleInfo.id){
                                renderData.modules.push(module);
                            }
                        });
                    });
                });
                var tmpl = config.usertmpl();
                res.send(lib.plugins.Mustache.render(tmpl,renderData));
            }
            else{
                res.send('无此用户数据');
            }
        });
        server.get('/pm/project/:pid',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var pid = req.params.pid;
            var type = req.query.type;
            var data = config.data();
            var pdata;
            data.projects.forEach(function(project){
                if(project.id == pid){
                    pdata = project;
                }
            });
            if(pdata){
                if(type == 'json'){
                    res.send(JSON.stringify({code:'A00000',data:pdata}));
                }
                else{
                    var tmpl = config.prjtmpl();
                    res.send(lib.plugins.Mustache.render(tmpl,pdata));
                }
            }
            else{
                res.send('无此项目数据');
            }
        });
        server.get('/pm/tmpl/:filename',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var filename = req.params.filename;
            res.send(lib.fs.readFile(Path.join(config.tmplRoot,filename)));
        });
        server.get('/pm/data/:filename',function(req,res,next){
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'PM',user:user});
            var filename = req.params.filename + '.json';
            res.send(lib.fs.readFile(Path.join(config.dataRoot,filename)));
        });
    }
});

module.exports = PM;