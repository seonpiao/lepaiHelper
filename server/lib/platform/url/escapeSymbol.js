define(function(require,exports,module){

    var escapeSymbol = function(source) {
        return String(source).replace(/[#%&+=\/\\\ \　\f\r\n\t]/g, function(all) {
            return '%' + (0x100 + all.charCodeAt()).toString(16).substring(1).toUpperCase();
        });
    };
    
    module.exports = escapeSymbol;
});