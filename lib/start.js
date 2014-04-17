/**
 * @file 启动测试服务
 * @author chris[wfsr@foxmail.com]
 */

var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var edp = require('edp-core');

var util = require('./util');


/**
 * 启动测试服务
 * 
 * @param {Object} opts 命令行选项参数对象
 */
exports.run = function (opts) {
    var emitter = new EventEmitter();
    for (var key in opts) {
        if (typeof opts[key] === 'undefined') {
            opts[key] = true;
        }
        else {
            opts[key] = opts[key] === 'true';
        }
    }

    var config = edp.util.extend(require('./config').config, opts);

    var server = require('./server');
    if (!server.build(emitter)) {
        edp.log.warn('Specs not found.');
        return;
    }

    var port = util.getPort(config, function (err, config) {
        var url = 'http://' + util.getIP() + ':' + config.port + '/';
        var serverConfig = require('edp-webserver/lib/config');
        serverConfig.port = config.port;
        var getLocations = serverConfig.getLocations;
        serverConfig.getLocations = function () {

            return [
                {
                    location: /^\/(index|home)?$/,
                    handler: server.handler('runner')
                    
                },
                {
                    location: /^\/debug\.html/,
                    handler: server.handler('debug')
                    
                },
                {
                    location: /^\/context\.html/,
                    handler: server.handler('context')
                    
                },
                {
                    location: /^\/src(\/[^\/]+)*\.js/,
                    handler: server.istanbul()
                    
                },
                {
                    location: /^\/.edp-test\/([^\?]+\.([^\?\.]+))/,
                    handler: server.serve()
                    
                }
            ].concat(getLocations());
        };

        console.log(require('qransi').create({ text: url, typeNumber: 0}));
        
        var webserver = require('edp-webserver').start(serverConfig);
        
        var io = require('socket.io').listen(webserver, {'log level': 1});
        var browsers = require('./browsers').init();

        if (config.singleRun) {
            emitter.on('finish', process.exit);
        }

        browsers.open(url);

        io.on('connection', function (socket) {

            socket.on('registerBrowser', function(browser) {
                browser.socket = socket;
                browser.emitter = emitter;
                browsers.add(browser);
            });

            socket.on('registerClient', function (client) {
                // TODO
            });

        });

    });
};





