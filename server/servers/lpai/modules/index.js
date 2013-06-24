var Modules = require('../../../core/modules');
var server = require('../../../core/core');
var Result = require('../../../core/result');
var lib = require('../../../lib/lib');
var ic = new lib.ic.InfoCenter({moduleName:'daemon'});
var Path = require('path');

var timer;

var heart = 0;

var interval = 5000;
var daemon;

var start = function(){
    ic.log('Start..');
    if(daemon)clearTimeout(daemon);
    daemon = setTimeout(function(){
        start();
    },30000);

    if(timer){
        clearTimeout(timer);
    }
    timer = setTimeout(function thread(){
        heart = new Date().getTime();
        ic.log('1.Request home page.')
        lib.http.request('http://www.lpai.com.cn/Index.aspx',{
            onsuccess:function(xhr,html){
                html = html + '';
                var matches = html.match(/window.setInterval\(\'AjaxGet\(\"(.+)\"\)\',1000\);/);
                if(matches){
                    var pids = matches[1];
                    ic.log('2.Request get change.');
                    // ic.log(pids);
                    lib.http.request('http://lpai.com.cn/Process/AjaxGetChange.ashx?pid_str=' + pids,{
                        headers:{
                            'Referer':'http://lpai.com.cn/Index.aspx'
                        },
                        onsuccess:function(xhr,result){
                            result = result.toString();
                            // ic.log(result);
                            // var arr = result.replace(/P:/,'').replace(/,V.*$/,'');
                            // arr = eval(arr);
                            var arr = result.split(',');
                            ic.log('3.Changes:' + arr.length);
                            arr.forEach(function(product){
                                var data = {
                                    curr:'',
                                    start:'',
                                    end:'',
                                    update:'',
                                    url:'',
                                    name:'',
                                    price:0,
                                    keys:{},
                                    users:[],
                                    newPrice:[]
                                };
                                product = product.split('|');
                                // ic.log('Product id : ' + product[5]);
                                /**
                                 * 8.48|上官小仙|8|0:00:08|0|65026|KMKZKVMFU
                                 * 
                                 * product[0] : price
                                 * product[1] : username
                                 * product[2] : unknown
                                 * product[3] : countdown
                                 * product[4] : unknown
                                 * product[5] : pid
                                 * product[6] : uid
                                 */
                                var dir = Path.join(__dirname,'../data/');
                                if(!lib.fs.isExist(dir)){
                                    lib.fs.mkdir(dir);
                                }
                                var dataFile = Path.join(dir,product[5] + '.json');
                                // ic.log('Data file : ' + dataFile);
                                try{
                                    ic.log('4.Read ' + product[5]);
                                    var content = lib.fs.readFile(dataFile);
                                }catch(e){
                                    ic.log('5.Not exist');
                                }
                                
                                if(content){
                                    try{
                                        data = JSON.parse(content);
                                    }
                                    catch(e){
                                        ic.log('6.Parse content error.');
                                        return;
                                    }
                                }
                                if(!data.url){
                                    data.url = 'http://lpai.com.cn/Bid/' + product[5] + '.html';
                                }
                                if(!data.name){
                                    var exp = new RegExp('<a href=.\\\/Bid\\\/' + product[5] + '.html. +title=.(.*?).>');
                                    try{
                                        data.name = html.match(exp)[1];
                                        ic.log('7.Name is ' + data.name);
                                    }
                                    catch(e){
                                        
                                    }
                                }
                                data.update = lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss');
                                // if(product.f != 1){
                                //     if(product.f == 5){
                                //         data.end = lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss');
                                //         lib.fs.writeFile(dataFile,decodeURIComponent(JSON.stringify(data)));
                                //     }
                                //     return;
                                // };
                            //     if(product.e > 11000 && product.e < 20000 && !data.start){
                            //         data.start = lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss');
                            //     }
                                var findUser = function(user){
                                    for(var i = 0; i < data.users.length; i++){
                                        if(data.users[i].name == user){
                                            return data.users[i];
                                        }
                                    }
                                    return null;
                                };
                                ic.log('8.Request BidShow.');
                                lib.http.request('http://lpai.com.cn/Process/BidShow.ashx?memberId=0&pId=' + product[5],{
                                    headers:{
                                        'Referer':'http://lpai.com.cn/Bid/' + product[5] + '.html'
                                    },
                                    onsuccess:function(xhr,result){
                                        // ic.log('User data result : ' + result);
                                        try{
                                            var usersData = JSON.parse(result);
                                        }
                                        catch(e){
                                            ic.log('9.Parse result error');
                                            return;
                                        }
                                        if(usersData.Tables.length > 1){
                                            var users = usersData.Tables[1].Rows;
                                            if(users.length){
                                                data.newPrice = [];
                                                for (var i = 0; i < users.length; i++){
                                                    if(users[i].price > data.price){
                                                        var user = decodeURIComponent(users[i].username);
                                                        var userData = findUser(user);
                                                        if(!userData){
                                                            userData = {
                                                                name:user,
                                                                start:lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss'),
                                                                last:lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss'),
                                                                times:1,
                                                                price:users[i].Price
                                                            };
                                                            data.users.push(userData);
                                                        }
                                                        else{
                                                            userData.times++;
                                                            userData.price = users[i].Price;
                                                            userData.last = lib.date.format(new Date(),'yyyy-MM-dd HH:mm:ss');
                                                        }
                                                        userData.purl = data.url;
                                                        userData.pname = data.name;
                                                        var dir = Path.join(__dirname,'../userdata/');
                                                        if(!lib.fs.isExist(dir)){
                                                            lib.fs.mkdir(dir);
                                                        }
                                                        var dataPath = Path.join(dir,user + '.json');
                                                        if(!lib.fs.isExist(dataPath)){
                                                            try{
                                                                lib.fs.writeFile(dataPath,'[]');
                                                            }
                                                            catch(e){}
                                                        }
                                                        try{var savedData = JSON.parse(lib.fs.readFile(dataPath)),found = false;}catch(e){console.log(dataPath)}
                                                        for(var j = 0; j < savedData.length; j++){
                                                            if(savedData[j].purl == userData.purl){
                                                                savedData[j] = userData;
                                                                found = true;
                                                                break;
                                                            }
                                                        }
                                                        if(!found)
                                                            savedData.push(userData);
                                                            try{
                                                                lib.fs.writeFile(dataPath,JSON.stringify(savedData));
                                                            }
                                                            catch(e){}
                                                            data.users.sort(function(a,b){
                                                            return (b.last > a.last) ? 1 : -1;
                                                        });
                                                        data.newPrice.push({
                                                            user:user,
                                                            price:users[i].price
                                                        })
                                                    }
                                                    else{
                                                        break;
                                                    }
                                                }
                                                data.price = parseFloat(users[0].price);
                                                try{
                                                    ic.log('10.Saving ' + product[5]);
                                                    lib.fs.writeFile(dataFile,(JSON.stringify(data)));
                                                }
                                                catch(e){ic.log('11.Saveing error.')}
                                            }
                                        }
                                        else{

                                        }
                                    }
                                });
                            });
                            timer = setTimeout(thread,interval);
                        },
                        onfailure:function(){
                            timer = setTimeout(thread,interval);
                        }
                    });
                }
                else{
                    timer = setTimeout(thread,interval);
                }
            },
            onfailure:function(){
                timer = setTimeout(thread,interval);
            }
        });
    },0);
};
start();
Modules.reg('index',{
    init:function(){
        server.get('/lpai/info',function(req,res,next){
            var pid = req.query.pid;
            var dir = Path.join(__dirname,'../data');
            if(!lib.fs.isExist(dir)){
                lib.fs.mkdir(dir);
            }
            var dataFile = Path.join(dir,pid + '.json');
            try{
                var tpl = lib.fs.readFile(Path.join(__dirname,'../tpls','info.mustache'));
                var data = JSON.parse(lib.fs.readFile(dataFile));
                res.send(lib.plugins.Mustache.render(tpl,data));
            }catch(e){
                res.send('无数据');
            }
        });
        server.get('/lpai/user',function(req,res,next){
            var name = decodeURIComponent(req.query.name);
            var dir = Path.join(__dirname,'../userdata');
            if(!lib.fs.isExist(dir)){
                lib.fs.mkdir(dir);
            }
            var dataPath = Path.join(dir,name + '.json');
            var userInfo = JSON.parse(lib.fs.readFile(dataPath));
            var tpl = lib.fs.readFile(Path.join(__dirname,'../tpls','userinfo.mustache'));
            res.send(lib.plugins.Mustache.render(tpl,{userInfo:userInfo}));
        });
    }
});
