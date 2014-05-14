
var natives = {
    esl: ['esl.js'],
    requirejs: ['esl.js'],
    jquery: ['jquery.js'],
    jasmine: ['jasmine/1.3.1/jasmine.css', 'jasmine/1.3.1/jasmine.js', 'jasmine/1.3.1/jasmine-html.js', 'jasmine/1.3.1/console.js']
};

var topLevelReg = /^[^\.]/;
var cssFileExt = /\.(css|styl|less|sass)$/i;
function buildTag(path) {
    if (topLevelReg.test(path)) {
        path = '.edp-test/' + path;
    }

    if (cssFileExt.test(path)) {
        return '<link rel="stylesheet" href="' + path + '">';
    }

    return '<script src="' + path + '"></script>';
}
/**
 * 生成配置文件中指定的 frameworks 代码
 *
 * @param {Array.<string>} files 所有指定的 Spec 文件路径
 * @return {string} 生成的 Spec 参数
 */
function buildFramwworks(frameworks) {
    var scripts = [];
    frameworks.forEach(function (name) {
        var files = natives[name];
        if (files) {
            files.forEach(function (file) {
                scripts.push(buildTag(file));
            });
        }
        else {
            scripts.push(buildTag(name));
        }
    });
    return scripts.join('\n');
}

var cached = null;
exports.render = function (frameworks) {
    if (!cached) {
        cached = buildFramwworks(frameworks);
    }
    return cached;
};