var Path = require('path');
var lib = require('../../../lib/lib');

var dataFile = Path.join('/data/users.json');
if(process.platform == 'win32'){
    dataFile = Path.join(__dirname,'users.json');
}
module.exports = {
    set:function(userInfo,callback){
        if(userInfo){
            var userData = lib.fs.readFile(dataFile);
            if(userData){
                userData = JSON.parse(userData);
                lib.object.forEach(userInfo,function(user,username){
                    lib.object.deepExtend(userData,userInfo);
                });
                lib.fs.writeFile(dataFile,JSON.stringify(userData));
            }
        }
        callback();
    },
    get:function(callback){
        var userData = lib.fs.readFile(dataFile);
        if(userData){
            callback(null,JSON.parse(userData));
        }
        else{
            callback(null,{});
        }
    }
}