var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var Path = require('path');
var Dependence = require('spm/lib/utils/Dependences');
var spm = require('../kit/spm');
var InfoCenter = require('../kit/infoCenter');
var CssCombo = require('css-combo');
lib.plugins.ArtTemplate.openTag = '/*{{';
lib.plugins.ArtTemplate.closeTag = '}}*/';

var info = {
    
};

var dependences = {};

var Compile = {
    config:function(options){
        lib.object.extend(config,options);
    }
};

process.on('message',function(msg){
    if(msg.type == 'initcompile'){
        dependences[msg.data.key] = {};
        info = msg.data.info;
    }
});

Plugins.reg('compile',{
    run:function(){
        server.get('/compile/init',function(req,res){
            var user = req.cookies.QFEUN;
            //代码运行环境,默认是生产环境;development是开发环境;
            var env = req.query.env || 'product';
            var project = req.query.project || 'main';
            info.data = {
                version:lib.date.format(new Date(),'yyyyMMddHHmmss'),
                platform:process.platform,
                username:user,
                env:env,
                project:project
            };
            var ic = new InfoCenter({moduleName:'Compile',user:user,version:info.data.version});
            ic.log('Compile init.');
            var key = lib.crypto.md5(Math.random());
            dependences[key] = {};
            if(server.isCluster()){
                process.send({
                    type:'initcompile',
                    data:{
                        key:key,
                        info:info
                    }
                });
            }
            res.cookie('QFECK',key,{httpOnly: true,domain:'.qiyife.com'});
            res.cookie('QFECVER',info.data.version,{httpOnly: true,domain:'.qiyife.com'});
            Result.sendOk(res);
        });
        //获取编译信息
        server.get('/compile/info',function(req,res){
            var path = req.query.path;
            var configFile = req.query.configfile;
            try{
                var config = lib.fs.readFile(Path.join(path,configFile));
                config = JSON.parse(config);
                info.config = config;
            }
            catch(err){
                Result.sendError(res,{data:err + ''});
                return;
            }
            var files = [];
            var user = req.cookies.QFEUN;
            var version = req.cookies.QFECVER;
            var ic = new InfoCenter({moduleName:'Compile',user:user,version:version});
            ic.log('Get compile info for ' + path + '.');
            config.list.forEach(function(item){
                if(item.files.match(/\.\w+$/)){
                    files.push({file:Path.join(path,item.files),path:item.path,must:!!item.must});
                }
                else if(item.files.match(/\*$/)){
                    var dir = item.files.replace(/\*$/,'');
                    var absDir = Path.join(path,dir);
                    lib.fs.recure(absDir,function(filePath,fileName){
                        var fullPath = Path.join(filePath,fileName);
                        if(lib.fs.isFile(fullPath)){
                            files.push({file:fullPath,path:item.path,must:!!item.must});
                        }
                    });
                }
            });
            Result.sendOk(res,{data:lib.object.extend({files:files},info.data)});
        });
        server.all('/compile/dependence',function(req,res){
            var key = req.cookies.QFECK;
            var file = req.query.file;
            var dependence = dependences[key];
            var depTree = new lib.data.Tree();
            var basePath = Path.dirname(file);
            var user = req.cookies.QFEUN;
            var version = req.cookies.QFECVER;
            var ic = new InfoCenter({moduleName:'Compile',user:user,version:version});
            ic.log('Get dependence for ' + file + '.');
            var getAllDeps = function(filepath,currNode){
                if(Path.extname(filepath) == ''){
                    filepath = filepath + '.js';
                }
                if(lib.fs.isExist(filepath)){
                    var currDir = Path.dirname(filepath);
                    var fileDependences;
                    if(dependence[filepath]){
                        fileDependences = dependence[filepath];
                    }
                    else{
                        var code = lib.fs.readFile(filepath);
                        // ic.info('Current info to render with : ' + JSON.stringify(info.data));
                        var render = lib.plugins.ArtTemplate.compile(code);
                        code = render(info.data);
                        lib.fs.writeFile(filepath,code);
                        try{
                            fileDependences = Dependence.parse(filepath);
                        }
                        catch(err){
                            Result.sendError(res,{data:err + ''});
                            return;
                        }
                        dependence[filepath] = fileDependences;
                    }
                    var deps = [];
                    fileDependences.forEach(function(relPath){
                        var fileFullPath = Path.join(currDir,relPath);
                        deps.push(fileFullPath + '.js');
                    });
                    var tmpNode = currNode;
                    var circlePath = [filepath];
                    while(tmpNode && tmpNode.getData && tmpNode.getData()){
                        var name = tmpNode.getData().name;
                        circlePath.push(name);
                        if(filepath == name){
                            Result.sendError(res,{data:'Find circle in [' + circlePath.reverse().join(' >> ') + ']'});
                        }
                        tmpNode = tmpNode.parent();
                    }
                    var treeNode = depTree.createNode({data:{name:filepath,deps:deps}});
                    currNode.append(treeNode);
                    fileDependences.forEach(function(relPath){
                        var fileFullPath = Path.join(currDir,relPath);
                        getAllDeps(fileFullPath,treeNode);
                    });
                }
                else{
                    Result.sendError(res,{data:'File [' + filepath + '] does not exist.'});
                }
            };
            getAllDeps(file,depTree);
            deps = [];
            depTree.forEach(function(data,level){
                if(level > 1){
                    data.deps.forEach(function(file){
                        if(deps.indexOf(file) == -1){
                            deps.push(file);
                        }
                    });
                }
            });
            // ic.info('Dependence of file : ' + deps.join(','));
            Result.sendOk(res,{data:deps});
        });
        server.all('/compile/build',function(req,res){
            var key = req.cookies.QFECK;
            var file = req.query.file;
            var dir = req.query.dir;
            var beautify = req.query.beautify == 'true';
            lib.fs.mkdir(dir);
            var user = req.cookies.QFEUN;
            var version = req.cookies.QFECVER;
            var ic = new InfoCenter({moduleName:'Compile',user:user,version:version});
            ic.log('Build file : ' + file + ' to ' + dir);
            if(beautify){
                spm.combo({
                    path:file,
                    dest:dir
                },function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        Result.sendOk(res);
                    }
                });
            }
            else{
                spm.compress({
                    path:file,
                    dest:dir
                },function(err){
                    if(err){
                        Result.sendError(res,{data:err + ''});
                    }
                    else{
                        Result.sendOk(res);
                    }
                });
            }
        });
        server.get('/compile/imports',function(req,res,next){
            var file = req.query.file;
            var compress = req.query.compress == 'true';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'ComboCss',user:user});
            var cfg = {
                target:file,
                inputEncoding:'utf-8'
            }
            CssCombo.getImports(cfg, function(err,imports){
                if(err){
                    ic.error(err + '');
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res,{data:imports});
                }
            });
        });
        server.get('/compile/combocss',function(req,res,next){
            var file = req.query.file;
            var path = req.query.path;
            var compress = req.query.compress == 'true';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'ComboCss',user:user});
            var cfg = {
                target:file,
                inputEncoding:'utf-8',
                output:path,
                compress:compress
            }
            CssCombo.build(cfg, function(err){
                if(err){
                    ic.error(err + '');
                    Result.sendError(res,{data:err + ''});
                }
                else{
                    Result.sendOk(res);
                }
            });
        });
    }
});

module.exports = Compile;