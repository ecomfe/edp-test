/**
 * @file 测试模块
 * @author chris[wfsr@foxmail.com]
 */
var karma = require('karma');
var path = require('path');
var fs = require('fs');

var dir = path.resolve(__dirname, 'node_modules', 'karma', 'lib');


exports.config = require('./lib/config');

exports.start = function (args) {

    // remove 'node' in argv
    process.argv.shift();
    // simulate 'karma xxx'
    process.argv[1] = 'karma';

    var cmd = args[0];
    if (!/^(init|start|run|completion)$/i.test(cmd)) {
        cmd = 'start';
        process.argv.splice(2, 1, cmd);
    }

    var testDir = path.resolve(process.cwd(), 'test/');
    var testConfig = path.resolve(testDir, 'config.js');

    // 保证有 test 目录
    if (!fs.existsSync(testDir)) {
        fs.mkdir(testDir)
    }


    var cli = require(path.join(dir, 'cli'));
    var init = require('./lib/init');

    if (cmd === 'init') {

        if (!fs.existsSync(testConfig)) {
            init.run();
            return;
        }

        var readline = require('readline');
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.write('已经存在测试配置文件，确定要覆盖? (yes or no)\n');
        rl.prompt()
        rl.write('yes');
        var isYes = true;
        process.stdin.on('keypress', function(s, key) {
            if (key.name === 'tab') {
                rl._deleteLineLeft();
                rl._deleteLineRight();
                rl.write(isYes ? 'no' : 'yes');
                rl.prompt();
                isYes = !isYes;
            }
        });

        rl.on('line', function (line) {
            if (line.toLowerCase() === 'yes') {
                init.run();
            }
            rl.close();
        });
        
    }
    else {
        // 不存在配置文件时自动创建
        if (!fs.existsSync(testConfig)) {
            console.log('未发现测试配置文件，自动创建...');
            init.run();
        }
        else {
            init.linkKarmaJs();
        }

        init.install(testConfig, function () {
            // 指定配置文件路径
            process.argv[3] = testConfig;
            cli.run();

        });

    }
    
};

