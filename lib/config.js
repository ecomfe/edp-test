/**
 * @file 配置文件解释
 * @author chris[wfsr@foxmail.com]
 **/

var fs = require('fs');
var path = require('path');

var edp = require('edp-core');


var defaultOptons = {

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['jasmine', 'esl'],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'coverage'],

    preprocessors: {
        // source files, that you wanna generate coverage for
        // do not include tests or libraries
        // (these files will be instrumented by Istanbul)
        'src/**/*.js': ['coverage'],
        'src/**/*.less': ['less'],
        'src/**/*.styl': ['stylus']
    },

    // web server port
    port: 8120,


    // enable / disable watching file and executing tests whenever any file changes
    watch: true,


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
};

/**
 * 调整 karma 的配置项以便兼容
 * 
 * @param {Object} config karma 配置对象
 */
function comb(config) {
    edp.log.info('检测到使用 karma 配置文件，执行兼容处理...');
    var files = [];
    config.files.forEach(function (file) {

        // 对象方式只取 pattern 属性值
        var pattern = typeof file === 'string' ? file : file.pattern;

        // 只保留样式及 spec 的 js
        if (/(test\/.*spec|\.css|\.less|\.sass|\.styl)/i.test(pattern)) {
            files.push(pattern); 
        }
        else {
            edp.log.warn('移除文件匹配规则：%s', JSON.stringify(file));
        }
    });
    config.files = files;

    var reporter = config.coverageReporter;
    if (reporter && reporter.type && reporter.type.indexOf('text') < 0) {
        reporter.type += '|text';
        edp.log.info('增加控制台报告输出');
    }
    edp.log.info('兼容处理完成');
}

/**
 * 合并配置，用户配置优先
 * 
 * @param {Object} options 用户配置数据
 */
function merge(options) {
    edp.util.extend(config, options);
}

var configFile = path.resolve(process.cwd(), 'test/config.js');
var userConfig;
var config;

// 语法糖
Object.defineProperty(module.exports, 'config', {

    /**
     * getter 获取配置
     * 
     * @return {Object} 配置对象
     */
    get: function () {
        if (!userConfig) {
            userConfig = require(configFile);
        }
        if (!config) {
            config = Object.create(defaultOptons);

            // 兼容 karma 的配置方式
            if(typeof userConfig === 'function') {
                userConfig({ set: merge });
                comb(config);
            }
            else {
                merge(userConfig);
            }
        }
        return config;
    },

    /**
     * setter 设置配置
     * 
     * @param {string|Object|Function} value 设置用户配置文件地址、对象或 Karma 方式的配置函数
     */
    set: function (value) {
        if (typeof value === 'string') {
            configFile = value;
            userConfig = null;
        }
        else {
            userConfig = value;
        }
        config = null;
    }
});