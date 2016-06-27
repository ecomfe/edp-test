/**
 * @file 运行测试服务
 * @author chris<wfsr@foxmail.com>
 **/

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令名称
 *
 * @type {string}
 */
cli.command = 'start';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [
    'port:',
    'singleRun',
    'watch',
    'node',
    'debug',
    'jasmine:'
];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '运行 edp-test 服务';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
cli.main = function (args, opts) {
    if (args.length && opts.node) {
        require('../../lib/benchmark').run(args);
    }
    else {
        require('../../index').start(args, opts);
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
