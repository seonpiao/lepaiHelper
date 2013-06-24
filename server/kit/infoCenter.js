var exec = require('child_process').exec;
var lib = require('../lib/lib');

var InfoCenter = lib.Class('InfoCenter',{
    construct:function(options){
        options = options || {};
        this._args = [];
        var extTpl = '';
        if(options.user){
            this._args.push(options.user);
            extTpl += '[%s]';
        }
        if(options.version){
            this._args.push(options.version);
            extTpl += '[%s]';
        }
        options.tmpl = '[%s][%s][%s]' + extTpl + ' >>> %s';
        this._ic = new lib.ic.InfoCenter(options);
    },
    methods:{
        log:function(str){
            var args = this._args.slice(0);
            args.push(str);
            this._ic.log.apply(this._ic,args);
        },
        info:function(str){
            var args = this._args.slice(0);
            args.push(str);
            this._ic.info.apply(this._ic,args);
        },
        warn:function(str){
            var args = this._args.concat([]);
            args.push(str);
            this._ic.warn.apply(this._ic,this._args);
        },
        error:function(str){
            var args = this._args.concat([]);
            args.push(str);
            this._ic.error.apply(this._ic,this._args);
        }
    }
});

module.exports = InfoCenter;