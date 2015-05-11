/**
 * @file 启动测试服务
 * @author chris<wfsr@foxmail.com>
 */

var EventEmitter = require('events').EventEmitter;
var path         = require('path');
var edp          = require('edp-core');
var util         = require('./util');

/**
 * 启动 WebServer
 *
 * @param {Object} config 配置项对象
 * @return {http.Server} edp-webserver 返回的 HTTP Server 实例
 * @param {module:server} server server模块
 */
function startServer(config, server) {
    var serverConfig;

    try {
        serverConfig = require(path.join(process.cwd(), '/edp-webserver-config'));
    }
    catch (e) {
        serverConfig = require('edp-webserver/lib/config');
    }

    serverConfig.port = config.port;

    // 屏蔽 edp-webserver 的 log
    serverConfig.logger = function () {};

    var getLocations = serverConfig.getLocations;

    // 注入处理器
    serverConfig.getLocations = function () {
        var locations = [
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
                location: /^\/.edp-test\/([^\?]+\.([^\?\.]+))/,
                handler: server.serve()

            }
        ].concat(getLocations());

        var hasSource = false;
        var sourceKey = 'source';
        var sourceLocation = {
            location: /^\/src(\/[^\/]+)*\.js\?v/,
            handler: server.istanbul()
        };

        locations.forEach(function (item, i) {
            if (item.key === sourceKey || String(item.location) == String(sourceLocation.location)) {
                hasSource = true;
                if (Object.prototype.toString.call(item.handler) === '[object Array]') {
                    item.handler.push(sourceLocation.handler);
                }
                else {
                    item.handler = [item.handler, sourceLocation.handler];
                }
            }
        });

        if (!hasSource) {
            locations.unshift(sourceLocation);
        }

        return locations;
    };

    return require('edp-webserver').start(serverConfig);
}

/**
 * 开始运行
 *
 * @param {Object} config 配置对象
 * @param {EventEmitter} emitter 事件发射器
 * @param {module:server} server server模块
 */
function start(config, emitter, server) {
    var url = 'http://' + util.getIP() + ':' + config.port + '/';

    // 输出二维码，方便移动端测试，可使用配置项打开或关闭
    if (config.qrcode) {
        console.log(require('qransi').create({ text: url, typeNumber: 0 }));
    }

    var webserver = startServer(config, server);
    var browsers = require('./browsers').init();

    var exit = function (code) {
        process.exit(code === 1 ? 1 : 0);
    };

    // 是否单次运行，否则执行完自动退出
    if (config.singleRun) {
        emitter.on('finish', exit);
    }

    if (process.platform === 'win32') {
        require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('SIGINT', exit);
    }

    process.on('SIGINT', exit);

    browsers.open(url, exit);


    var io = require('socket.io').listen(webserver, { 'log level': 1 });
    io.on('connection', function (socket) {

        socket.on('registerBrowser', function(browser) {
            browser.socket = socket;
            browser.emitter = emitter;
            browsers.add(browser);
        });

        socket.on('registerClient', function (client) {
            // TODO：服务器模式
        });

    });
}

/**
 * 启动测试服务
 *
 * @param {Object} opts 命令行选项参数对象
 */
exports.run = function (opts) {

    for (var key in opts) {
        if (typeof opts[key] === 'undefined') {
            opts[key] = true;
        }
        else {
            opts[key] = opts[key] === 'true';
        }
    }

    var config = edp.util.extend(require('./config').config, opts);
    var emitter = new EventEmitter();

    var server = require('./server');

    if (!server.build(emitter)) {
        edp.log.warn('Specs not found.');
        return;
    }

    util.getPort(config, function (err, config) {
        start(config, emitter, server);
    });
};





