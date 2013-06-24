define(function(require,exports,module){

    var defaultUrl = 'http://jsmsg.video.qiyi.com/m.gif';
    var serverLogimgList = {};
    
    var server = function(param,url){
        url = url || defaultUrl;
        if(param){
            var img = new Image();
            var key = 'slog_' + Math.floor(Math.random() * 2147483648).toString(36);
            serverLogimgList[key] = img;
            img.onload = img.onerror = img.onabort = function(){
                img.onload = img.onerror = img.onabort = null;
                serverLogimgList[key] = null;
                delete serverLogimgList[key];
                img = null;
            };
            var params = [];
            param.t = Math.round(Math.random() * 2147483647);
            for(var key in param){
                params.push(key + '=' + encodeURIComponent(param[key]));
            }
            img.src = url + '?' + params.join('&');
        }
    }

    module.exports = server;
});