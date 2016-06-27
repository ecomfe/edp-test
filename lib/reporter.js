/**
 * @file 测试报告输出
 * @author chris<wfsr@foxmail.com>
 */

var path      = require('path');
var istanbul  = require('istanbul');
var edp       = require('edp-core');
var config    = require('./config').config;
var translate = require('./translate');

var chalk     = edp.chalk;
var Store     = istanbul.Store;

/**
 * 覆盖率报告生成需要的存储信息
 *
 * @constructor
 * @param {Object} opts 配置项对象
 */
function BasePathStore(opts) {
    Store.call(this, opts);
    opts = opts || {};
    this.basePath = opts.basePath;
    this.delegate = Store.create('fslookup');
}

/**
 * 类型
 *
 * @const
 * @type {string}
 */
BasePathStore.TYPE = 'basePathlookup';

// 继承自 Store
require('util').inherits(BasePathStore, Store);

// 扩展 BasePathStore 原型
Store.mix(BasePathStore, /** @lends BasePathStore.prototype */ {

    /**
     * 获取所有键名
     *
     * @return {Array}
     */
    keys: function () {
        return this.delegate.keys();
    },

    /**
     * 转换
     *
     * @param {string} key 待转换的键
     * @return {string} 转换后的键
     */
    toKey: function (key) {
        if (key.indexOf('./') === 0) {
            return path.join(this.basePath, key);
        }
        return key;
    },

    /**
     * 获取键值
     *
     * @param {string} key 指定要获取的键值
     * @return {string} key 键对应的值
     */
    get: function (key) {
        return this.delegate.get(this.toKey(key));
    },

    /**
     * 判断是否存在指定的键名
     *
     * @param {string} key 指定的键名
     * @return {boolean} 是否存在指定的键名
     */
    hasKey: function (key) {
        return this.delegate.hasKey(this.toKey(key));
    },

    /**
     * 设置键值
     *
     * @param {string} key 键名
     * @param {string} contents 键值内容
     * @return {string} 设置的键名
     */
    set: function (key, contents) {
        return this.delegate.set(this.toKey(key), contents);
    }
});

/**
 * 打印每个 Spec 的执行结果
 *
 * 连续成功的结果会自动折叠，失败的结果将飘红展开显示
 *
 * @param {Object} result Spec 执行结果相关数据
 * @param {module:Browser} browser 当前浏览器实例
 */
exports.result = function (result, browser) {
    var percent = ((result.no) * 100 / result.total).toFixed(0) + '%';

    if (result.success) {
        console.log(''
            + '\x1B[1A\x1B[2K'
            + browser.name
            + '：Executed %s (%d / %d)',
            percent,
            result.no,
            result.total
        );
    }
    else {
        console.log(
            chalk[result.skipped ? 'yellow' : 'red']('%s：%s (%d / %d): %s - %s'),
            browser.name,
            percent,
            result.no,
            result.total,
            result.suite.join(' - '),
            result.description
        );

        var msg = '';
        result.log.forEach(function (log) {
            msg += '\t' + log.replace(/\n/g, '\n\t') + '\n';
        });

        console.log(chalk.red(msg));
    }
};

/**
 * 完成全部测试后打印汇总信息
 *
 * @param {Object} result 当前浏览器执行的覆盖率数据
 * @param {module:Browser} browser 当前浏览器实例
 * @param {Function} callback 处理完成后的回调
 */
exports.complete = function (result, browser, callback) {
    console.log(browser.name + ':');

    if (browser.fails) {
        console.log(''
            + chalk.green('\tedp test')
            + chalk.red(' [FAILURE] ')
            + 'TOTAL: %d '
            + chalk.red('FAIL')
            + ', %d '
            + chalk.yellow('SKIP')
            + ', %d '
            + chalk.green('SUCCESS')
            + '\n',
            browser.fails,
            browser.skips,
            browser.successes
        );
    }
    else {
        console.log(''
            + chalk.green('\tedp test')
            + chalk.green(' [SUCCESS] ')
            + 'TOTAL: %d '
            + chalk.yellow('SKIP')
            + ', %d '
            + chalk.green('SUCCESS')
            + '\n',
            browser.skips,
            browser.successes
        );
    }

    if (!result.coverage || !browser.total) {
        callback();
        return;
    }

    var coverageDir = path.resolve(process.cwd(), config.coverageReporter.dir, browser.name);
    require('./util').mkdir(coverageDir, function () {
        var options = {
            dir: coverageDir,
            sourceStore: new BasePathStore({
                basePath: config.basePath
            })
        };

        config.coverageReporter.type.split(/\s*\|\s*/).forEach(function (type) {

            var coverage = translate(result.coverage, {sourceMaps: global.maps});
            var collector = new istanbul.Collector();
            collector.add(coverage);

            var reporter = istanbul.Report.create(type, options);
            reporter.writeReport(collector, true);
        });

        callback();

    });

};
