var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;



var node_modules = path.resolve(__dirname, '../', 'node_modules');
var karma_node_modules = path.resolve(
    node_modules,
    'karma',
    'node_modules'
);

function install(cwd, moduleId, callback) {
    var child = exec(
        'npm install ' + moduleId,
        {
            cwd: cwd
        },
        callback
    );
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}

function detectModule(mod, callback) {

    var modPath = path.resolve(node_modules, mod);
    var subModPath = path.resolve(karma_node_modules, mod);
    if (!fs.existsSync(subModPath) && !fs.existsSync(modPath)) {
        console.log('未找到 %s，正在安装...', mod);
        install(karma_node_modules, mod, function (error) {
            console.log(error ? '%s 安装失败' : '%s 安装成功', mod);
            if (!error && callback) {
                callback();
            }
        });
    }
    else if (callback) {
        callback();
    }
}

exports.exec = function (mod, callback) {
    detectModule(mod, callback);
};