/**
 * @file edp 测试模块
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
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '对当前项目运行单元测试';

/**
 * 模块命令行运行入口
 * 
*/
cli.main = function () {
    var log = require( 'edp-core' ).log;
    log.info('See `edp test --help`');
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;