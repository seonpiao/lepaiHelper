var lib = require('../../lib/lib');
var Path = require('path');
            var dataPath = Path.join(__dirname,'data/');
            var userInfo = {};
            lib.fs.recure(dataPath,function(path,filename){
                var dataFile = Path.join(path,filename);
                var data = JSON.parse(lib.fs.readFile(dataFile));
                if(data.users.length){
                    for(var i = 0; i < data.users.length; i++){
                            var username = data.users[i].name;
                            data.users[i].purl = data.url;
                            data.users[i].pname = data.name;
                            userInfo[username] = userInfo[username] || [];
                            userInfo[username].push(data.users[i]);
                    }
                }
            });
        for(var username in userInfo){
            lib.fs.writeFile(Path.join(__dirname,'userdata/',username + '.json'),JSON.stringify(userInfo[username]));
        }
