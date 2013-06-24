exports.sendOk = function(res,data){
    var obj = {
        code:'A00000'
    }
    if(data && data.code)obj.code = data.code;
    if(data && data.data)obj.data = data.data;
    res.send(JSON.stringify(obj));
};

exports.sendError = function(res,data){
    var obj = {
        code:'A00001'
    }
    if(data && data.code)obj.code = data.code;
    if(data && data.data)obj.data = data.data;
    res.send(JSON.stringify(obj));
};

exports.send = function(res,data){
    if(data.redirect){
        res.redirect(data.redirect);
    }
    else if(data.response){
        res.send(data.response);
    }
};