var server = require('../../core/core');
var lib = require('../../lib/lib');
lib.ic.InfoCenter.enable();
var ic = new lib.ic.InfoCenter({moduleName:'weeklyServer'});

var SvnHook = require('./modules/index');

var port = '927';
server.start({
	port:port
});