/**
 * @file 测试模块
 * @author chris<wfsr@foxmail.com>
 */
var fs = require('fs');
var path = require('path');

var edp = require('edp-core');

/**
 * 检查配置文件是否存在
 *
 * @return {boolean}
 */
function check() {
    process.chdir(edp.path.getRootDirectory());

    var testDir = path.resolve(process.cwd(), 'test/');
    var testConfig = path.resolve(testDir, 'config.js');

    // 保证有 test 目录
    if (!fs.existsSync(testDir)) {
        fs.mkdir(testDir);
    }

    return fs.existsSync(testConfig);
}

/**
 * 初始化配置
 *
 * @param {Object} opts 命令选项
 */
exports.init = function (opts) {
    var init = require('./lib/init');
    var force = 'force' in opts;

    if (!check() || force) {
        init.run();
        return;
    }

    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.write('已经存在测试配置文件，确定要覆盖? (yes or No)\n');
    rl.prompt();
    rl.write('no');
    var isYes = false;
    process.stdin.on('keypress', function (s, key) {
        if (~'up,down,tab'.indexOf(key.name)) {
            rl._deleteLineLeft();
            rl._deleteLineRight();
            rl.write(isYes ? 'no' : 'yes');
            rl.prompt();
            isYes = !isYes;
        }
    });

    rl.on('line', function (line) {
        init.run(line.toLowerCase() === 'yes');
        rl.close();
    });
};

/**
 * 运行测试服务
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
exports.start = function (args, opts) {
    if (!check() && !('node' in opts)) {
        require('./lib/init').run();
    }

    require('./lib/start').run(args, opts);

};

