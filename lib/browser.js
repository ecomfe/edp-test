/**
 * @file 浏览器类
 * @author chris[wfsr@foxmail.com]
 */

var useragent = require('useragent');
var edp       = require('edp-core');
var reporter  = require('./reporter');

var log       = edp.log;
var util      = edp.util;


/**
 * 待注册的所有 sockeet 事件
 *
 * @type {Object}
 */
var events = {

    /**
     * 开始测试事件
     *
     * @param {number} total 总的 Spec 数量
     */
    start: function (total) {
        this.total = total;
    },

    /**
     * 报告结果
     *
     * @param {Object} result 测试结果数据对象
     */
    result: function (result) {
        this.count++;
        result.no = this.count;

        if (result.id + 1 - result.no > 0) {
            this.skips = result.id + 1 - result.no;
        }

        if (result.skipped) {
            this.skips++;
        }
        else if (result.success) {
            this.successes++;
        }
        else {
            this.fails++;
        }

        reporter.result(result, this);
    },

    /**
     * 完成测试事件
     *
     * @param {Object} result 汇总的测试结果数据对象
     */
    complete: function (result) {
        var self = this;
        reporter.complete(result, this, function () {
            self.browsers.recount(self.emitter);
        });

    }
};

/**
 * Browser 默认选项
 *
 * @type {Object}
 */
var defaultOptions = {
    id: '',
    fullName: '',
    socket: null,
    emitter: null
};

/**
 * 管理对应浏览器实例的类
 *
 * @constructor
 * @param {Object} options 浏览器选项，见 `defaultOptions`
 */
var Browser = function (options) {
    util.extend(this, defaultOptions, options);

    var agent = useragent.parse(this.fullName);
    this.name = agent.toAgent() + ' (' + agent.os + ')';
    this.skips = 0;
    this.fails = 0;
    this.count = 0;
    this.successes = 0;

    var socket = this.socket;
    for (var key in events) {
        socket.on(key, events[key].bind(this));
    }

    this.onChange = this.onChange.bind(this);
    this.emitter.on('change', this.onChange);

    log.info('%s - %s connected.\n', this.name, this.id);
    socket.emit('execute');
};

Browser.prototype = {

    constructor: Browser,

    /**
     * 文件变化时通知浏览器
     *
     * @param {string} path 有变化的文件路径
     */
    onChange: function (path) {
        this.skips = 0;
        this.fails = 0;
        this.socket.emit('reload', path);
    },

    /**
     * 序列化浏览器信息
     *
     * @return {Object}
     */
    serialize: function () {
        return {
            id: this.id,
            name: this.name
        };
    },

    /**
     * 当有浏览器连接或断开时通知更新
     *
     * @param {Array.<Object>} browsers 序列化后的所有浏览器信息数组
     */
    update: function (browsers) {
        this.socket.emit('update', browsers);
    },

    /**
     * 通知空闲状态
     *
     */
    idle: function () {
        this.socket.emit('idle');
    },

    /**
     * 销毁对象
     *
     * @return {[type]} [return description]
     */
    dispose: function () {
        this.socket.removeAllListeners();
        this.emitter.removeListener('change', this.onChange);

        this.socket = null;
        this.emitter = null;
    }
};


module.exports = Browser;
