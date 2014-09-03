/**
 * @file 匹配的文件
 * @author chris[wfsr@foxmail.com]
 */

var edp  = require('edp-core');
var glob = edp.glob;

/**
 * 根据扩展名判断是否(或可生成) JavaScript 的文件
 *
 * @param {string} path 文件路径
 * @return {boolean} 判断结果
 */
function isJs(path) {
    return /\.(js|ts|dart|coffee)$/i.test(path);
}

/**
 * 列出所有匹配的文件，并剔除排除的文件。
 *
 * @param {Array.<string>} includes 文件匹配模式
 * @param {?Array.<string>=} excludes 文件排除模式
 * @return {Object} 匹配的对象，包含 js 和 css 字段的数组
 */
exports.readAll = function (includes, excludes) {
    var files = {
        css: [],
        js: []
    };

    var patterns = includes.slice(0);
    excludes && excludes.forEach(function (exclude) {
        patterns.push('!' + exclude);
    });

    var list = glob.sync(patterns, { nodir: true });
    list.forEach(function (path) {
        files[isJs(path) ? 'js' : 'css'].push(path);
    });

    return files;
};
