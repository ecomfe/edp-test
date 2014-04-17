/**
 * @file 初始化配置
 * @author chris[wfsr@foxmail.com]
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
cli.command = 'init';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [
    'force:'
];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '初始化 edp-test，创建配置文件';

/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
cli.main = function (args, opts) {
    require('../../index').init(opts);
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;