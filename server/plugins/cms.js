var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var InfoCenter = require('../kit/infoCenter');

var getOverwrites = function(content){
    var pattern = /\/data[^<]+/g;
    return content.match(pattern);
};

Plugins.reg('cms',{
    run:function(){
        server.get('/cms/upload',function(req,res,next){
            var cmsip = req.query.cmsip || '10.10.131.68';
            var cmsport = req.query.cmsport || '80';
            var project = req.query.project || '';
            var url = 'http://' +  cmsip + ':' + cmsport + '/upload/uploadZip.action?loginIgnore=true&randomFileName=true&zipSaveDomain=false&channelId=-1&customChannelName=' + project;
            var filePath = req.query.filepath;
            var boundary = new Date().getTime().toString(36);
            var queryName = req.query.queryname || '';
            var contentType = req.query.contenttype || 'text/plain';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Cms',user:user});
            ic.log('Upload  ' + filePath + ' to ' + cmsip + ':' + cmsport);
            lib.http.request(url,{
                method:'POST',
                file:{
                    boundary:boundary,
                    path:filePath,
                    query:queryName,
                    contentType:contentType
                },
                headers:{
                    'Content-Type':'multipart/form-data; boundary=' + boundary
                },
                onsuccess:function(xhr,body){
                    body = body.toString();
                    if(body.match(/\u4e0a\u4f20\u6210\u529f/)){
                        Result.sendOk(res,{data:{overwrites:getOverwrites(body)}});
                    }
                    else{
                        Result.sendError(res,{data:body});
                    }
                }
            });
        });
        server.get('/cms/uploadfile',function(req,res,next){
            var cmsip = req.query.cmsip || '10.10.131.68';
            var cmsport = req.query.cmsport || '80';
            var project = req.query.project || '';
            var url = 'http://' +  cmsip + ':' + cmsport + '/upload/upload.action?loginIgnore=true&randomFileName=true&channelId=-1&customChannelName=' + project;
            var filePath = req.query.filepath;
            var boundary = new Date().getTime().toString(36);
            var queryName = req.query.queryname || 'upload';
            var contentType = req.query.contenttype || 'text/plain';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Cms',user:user});
            ic.log('Upload file ' + filePath + ' to ' + cmsip + ':' + cmsport);
            lib.http.request(url,{
                method:'POST',
                file:{
                    boundary:boundary,
                    path:filePath,
                    query:queryName,
                    contentType:contentType
                },
                headers:{
                    'Content-Type':'multipart/form-data; boundary=' + boundary
                },
                onsuccess:function(xhr,body){
                    body = body.toString();
                    if(body.match(/\u4e0a\u4f20\u6210\u529f/)){
                        Result.sendOk(res,{data:{overwrites:getOverwrites(body)}});
                    }
                    else{
                        Result.sendError(res,{data:body});
                    }
                }
            });
        });
        //上线测试环境
        server.get('/cms/updatetest',function(req,res,next){
            var file = req.query.file;
            var cmsip = req.query.cmsip;
            var cmsport = req.query.cmsport || '8080';
            var url = 'http://' +  cmsip + ':' + cmsport + '/upload/updateFile.action?loginIgnore=true';
            url += '&name=' + encodeURIComponent(file);
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Cms',user:user});
            ic.log('Update ' + file + ' on ' + cmsip + ':' + cmsport);
            lib.http.request(url,{
                method:'GET',
                onsuccess:function(xhr,body){
                    body = (body + '').trim();
                    ic.info('Update ' + url +  ' : ' + body);
                    Result.sendOk(res,{data:body});
                }
            });
        });
        //上线正式环境
        server.get('/cms/update',function(req,res,next){
            var file = req.query.file;
            var cmsip = '10.10.131.68';
            var cmsport = '80';
            var url = 'http://' +  cmsip + ':' + cmsport + '/upload/updateFile.action?loginIgnore=true';
            url += '&name=' + encodeURIComponent(file);
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({moduleName:'Cms',user:user});
            ic.log('Update ' + file + ' on ' + cmsip + ':' + cmsport);
            lib.http.request(url,{
                method:'GET',
                onsuccess:function(xhr,body){
                    body = body.toString().trim();
                    ic.info('Update ' + url +  ' : ' + body);
                    Result.sendOk(res,{data:body});
                }
            });
        });
    }
});

// module.exports = Login;