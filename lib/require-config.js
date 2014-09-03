/**
 * @file require.config 配置处理
 * @author chris[wfsr@foxmail.com]
 **/

var fs   = require('fs');
var path = require('path');
var edp  = require('edp-core');

/**
 * 合并 require.config 配置
 *
 * @param {Object} target 要合并到的目标配置
 * @param {Object} source 被合并的源配置
 * @returns {Object}
 */
exports.merge = function (target, source) {
    var toString = Object.prototype.toString;

    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            if (toString.call(source[key]) === '[object Object]') {
                target[key] = exports.merge(target[key] || {}, source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }

    return target;
};

/**
 * 从项目中读取 module.conf 的配置
 *
 * @returns {Object}
 */
exports.readFromProject = function () {
    var moduleConfig = path.join(edp.path.getRootDirectory(), 'module.conf');

    return fs.existsSync(moduleConfig) ? JSON.parse(fs.readFileSync(moduleConfig, 'utf-8')) : {};
};
