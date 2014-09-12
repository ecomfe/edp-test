/**
 * @file 初始化测试配置
 * @author chris<wfsr@foxmail.com>
 */

var fs   = require('fs');
var path = require('path');
var log  = require('edp-core').log;

/**
 * 字符串转驼峰
 *
 * @param {string} key 输入字符
 * @return {string} 转换后的字符
 */
function camel(key) {
    return key.toLowerCase().replace(/_[a-z]/g, function (a) {
        return a.slice(1).toUpperCase();
    });
}

/**
 * 序列化时增加引号
 *
 * @param {*} value 输入
 * @return {string} 序列化后的字符串
 */
function quote(value) {
    return typeof value !== 'string' ? JSON.stringify(value) : '\'' + value + '\'';
}

/**
 * 从模板生成配置文件
 *
 * @param {string} from 模板文件
 * @param {string} to 目标文件路径
 * @param {Object} config 渲染模板使用的数据
 * @return {string} 目标文件最终路径
 */
function buildFromTemplate(from, to, config) {
    var cwd = process.cwd();
    var configFile = 'test/' + to;
    var configFilePath = path.resolve(cwd, configFile);

    var tplFile = path.resolve(
        __dirname,
        '../' + from
    );

    config = config || {};
    config.date = config.date || new Date();

    var content = fs.readFileSync(tplFile, 'utf-8').replace(
        /%(.*)%/g,
        function(a, key) {
            var value = config[camel(key)];
            if (value instanceof Array) {
                value = value.map(quote).join(', ');
            }
            return value;
        }
    );

    fs.writeFileSync(configFilePath, content);

    return configFilePath;

}


/**
 * 运行初始化
 *
 * @param {boolean=} override 是否覆盖现有文件
 */
exports.run = function (override) {

    if (override !== false) {

        log.info('正在生成配置文件 `test/config.js` ...');
        buildFromTemplate('conf.tpl.js', 'config.js');
        log.info('配置文件生成。');
    }

};
