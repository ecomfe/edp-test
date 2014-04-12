/**
 * @file 配置文件解释
 * @author chris[wfsr@foxmail.com]
 **/
 var fs = require('fs');
var path = require('path');

var util = require('edp-core').util;


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
 * 合并配置，用户配置优先
 * 
 * @param {Object} options 用户配置数据
 */
function merge(options) {
    util.extend(config, options);
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