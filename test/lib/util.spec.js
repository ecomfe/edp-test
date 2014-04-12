/**
 * @file 工具函数测试
 * @author chris[wfsr@foxmail.com]
 **/

var fs = require('fs');
var path = require('path');


describe('工具函数', function () {

    it('getIP', function () {
        var util = require('../../lib/util');
        var ip = util.getIP();
        var defultAddress = '127.0.0.1';

        if (ip !== defultAddress) {
            var ifaces = require('os').networkInterfaces();
            var found = false;
            for (var dev in ifaces) {
                ifaces[dev].forEach(
                    function(details) {
                        if (ip === details.address && details.family === 'IPv4') {
                            found = true;
                        }
                    }
                );
            }
            expect(found).toBe(true);
        }
    });


    it('getPort', function (done) {
        var util = require('../../lib/util');

        // 保证是本地可用的端口
        var port = 8765;
        var config = { port: port };

        // 先占用
        var server = require('http').createServer();
        server.listen(config.port);
        
        util.getPort(config, function (err, config) {
            expect(err).toBeNull();
            expect(config.port).not.toBe(port);

            // 可能会一直向上加 1 直至找到可用的端口
            expect(config.port).toBe(port + 1);
            done();
        })        
        
    });

});