/**
 * @file 配置解释测试
 * @author chris[wfsr@foxmail.com]
 **/

 var path = require('path');


describe('配置文件解释', function () {

    it('默认配置', function () {
        var mod = require('../../lib/config');
        mod.config = {};

        expect(mod.config.files).toBeUndefined();
        expect(mod.config.singleRun).toBe(true);
        expect(mod.config.watch).toBe(true);
    });

    it('用户配置文件', function () {
        var mod = require('../../lib/config');
        var configFile = path.resolve(process.cwd(), 'fixture/config.js');
        mod.config = configFile;

        expect(mod.config.files).toBeDefined();
        expect(mod.config.foo).toBe('bar');
        expect(mod.config.watch).toBe(true);
    });

    it('用户配置对象', function () {
        var mod = require('../../lib/config');
        mod.config = { foo: 'bar', singleRun: false };

        expect(mod.config.foo).toBe('bar');
        expect(mod.config.singleRun).toBe(false);
        expect(mod.config.watch).toBe(true);
    });

});