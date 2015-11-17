/**
 * @file 浏览器集合管理
 * @author chris<wfsr@foxmail.com>
 */

var launcher = require('edp-browser-launcher2');
var Browser  = require('./browser');
var edp      = require('edp-core');

var log      = edp.log;

/**
 * 存储所有客户端的键值对
 *
 * 以客户端 userAgent 的 hash 值为 key
 * Browser 实例为 value
 *
 * @namespace
 * @inner
 */
var map = {};

/**
 * 自动打开的浏览器子进程对象数组
 *
 * @type {Array}
 * @inner
 */
var instances = [];

/**
 * 是否已初始化
 *
 * @type {boolean}
 * @inner
 */
var inited = false;

/**
 * 客户端(浏览器)的集合管理
 *
 * @type {Object}
 */
var browsers = {

    /**
     * 根据配置文件配置的浏览器打开指定网址
     *
     * @param {string} url 要打开的网址
     * @param {Function} failCallback 失败后的回调
     */
    open: function (url, failCallback) {
        launcher(function (err, launch) {
            var fail = function () {
                if (err) {
                    log.error(err);
                    return failCallback(err);
                }
            };

            if (err) {
                return fail(err);
            }

            require('./config').config.browsers.forEach(function (browser) {

                launch(url, {browser: browser.toLowerCase()}, function (err, instance) {
                    if (err) {
                        return fail(err);
                    }

                    instances.push(instance);
                });

            });
        });
    },

    /**
     * 初始化，只执行一次
     *
     * @return {browsers} 当前模块对象
     */
    init: function () {
        if (!inited) {
            this.finished = 0;
            this.recount = this.recount.bind(this);

            // kill all browsers on process exit
            process.on('exit', this.kill.bind(this));
            inited = true;
        }
        return this;
    },

    /**
     * 添加浏览器
     *
     * @param {Browser|Object} browser 待添加的浏览器实例或客户端相关信息
     * @return {Browser} 刚添加的浏览器实例对象
     */
    add: function (browser) {

        // 忽略同一浏览器的其他窗口
        if (map[browser.id]) {
            return false;
        }

        if (!(browser instanceof Browser)) {
            browser = new Browser(browser);
        }

        map[browser.id] = browser;
        browser.browsers = this;
        this.update();

        return browser;
    },

    /**
     * 移除浏览器
     *
     * @param {Browser|Object} browser 要移除的浏览器实例或客户端相关信息
     * @return {boolean} 移除执行的结果，不存在时返回 false
     */
    remove: function (browser) {

        var id = browser.id;
        if (!map[id]) {
            return false;
        }

        map[id].dispose();

        delete map[id];
        this.update();

        return true;
    },

    /**
     * 重算执行完成的客户端数
     *
     * @param {EventEmitter} emitter 全局的事件对象实例
     */
    recount: function (emitter) {
        var total = this.length;
        this.finished++;

        if (total === this.finished) {
            var fails = 0;
            this.each(function (browser) {
                fails += browser.fails;
                browser.idle();
            });
            emitter.emit('finish', fails > 0 ? 1 : 0);
            this.finished = 0;
        }
    },

    /**
     * 通知所有客户端更新
     *
     */
    update: function () {
        var browsers = [];
        var id;

        for (id in map) {
            browsers.push(map[id].serialize());
        }

        for (id in map) {
            map[id].update(browsers);
        }
    },

    /**
     * 遍历所有客户端实例的快捷方法
     *
     * @param {Function} callback 迭代回调的方法
     */
    each: function (callback) {
        for (var id in map) {
            callback(map[id]);
        }
    },

    /**
     * 杀掉所有浏览器进程
     */
    kill: function () {
        var instance;
        while (instance = instances.shift()) {
            instance.stop();
        }
    }
};

/**
 * 外部获取客户端数量的接口
 *
 * @name browser.length
 * @type {number}
 */
Object.defineProperty(browsers, 'length', {
    get: function () {
        return Object.keys(map).length;
    }
});


module.exports = browsers;
