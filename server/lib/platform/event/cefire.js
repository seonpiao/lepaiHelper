define(function(require,exports,module){
    
    var _listeners = require('./lists');
    
    var lists = _listeners.customListeners;
    var cefire = function (element, ev) {
        var type = ev.type.replace(/^on/i, '').toLowerCase();
        var data = ev.data;
        var listeners = lists[type];
        if(listeners && listeners.length > 0){
            listeners.forEach(function(obj,index){
                try{
                    obj.listener({type:type,data:data});
                }catch(e){

                }
            });
        }
        return element;
    };

    module.exports = cefire;
});