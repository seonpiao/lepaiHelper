var server = require('../core/core');
var Plugins = require('../core/plugins');
var Result = require('../core/result');
var lib = require('../lib/lib');
var Fs = require('../kit/fs');
var InfoCenter = require('../kit/infoCenter');

Plugins.reg('fs', {
    init: function() {
        server.get('/fs/mv', function(req, res, next) {
            var src = req.query.src;
            var dest = req.query.dest;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({
                moduleName: 'Fs',
                user: user
            });
            Fs.mv({
                src: src,
                dest: dest
            }, function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            });
        });
        server.get('/fs/cp', function(req, res, next) {
            var src = req.query.src;
            var dest = req.query.dest;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({
                moduleName: 'Fs',
                user: user
            });
            Fs.cp({
                src: src,
                dest: dest
            }, function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            });
        });
        server.get('/fs/mkdir', function(req, res, next) {
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({
                moduleName: 'Fs',
                user: user
            });
            Fs.mkdir({
                path: path
            }, function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            });
        });
        server.get('/fs/rm', function(req, res, next) {
            var path = req.query.path;
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({
                moduleName: 'Fs',
                user: user
            });
            Fs.rm({
                path: path
            }, function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            });
        });

        server.get('/fs/chmod', function(req, res, next) {
            var path = req.query.path;
            var mode = req.query.mode + '';
            var user = req.cookies.QFEUN;
            var ic = new InfoCenter({
                moduleName: 'Fs',
                user: user
            });
            Fs.chmod({
                path: path,
                mode: mode
            }, function(err) {
                if (err) {
                    ic.error(err);
                    Result.sendError(res, {
                        data: err + ''
                    });
                } else {
                    Result.sendOk(res);
                }
            });
        });

    }
});