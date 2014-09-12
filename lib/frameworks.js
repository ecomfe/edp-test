/**
 * @file 配置文件中的 framworks 加载代码处理
 * @author chris<wfsr@foxmail.com>
 **/

/**
 * 内置的 frameworks
 *
 * @type {Object.<string, Array>}
 */
var natives = {
    esl: ['esl.js'],
    requirejs: ['esl.js'],
    jasmine: [
        'jasmine/1.3.1/jasmine.css',
        'jasmine/1.3.1/jasmine.js',
        'jasmine/1.3.1/jasmine-html.js',
        'jasmine/1.3.1/console.js'
    ],
    jasmine2: [
        'jasmine/2.0.0/jasmine.css',
        'jasmine/2.0.0/jasmine.js',
        'jasmine/2.0.0/jasmine-html.js',
        'jasmine/2.0.0/boot.js',
        'jasmine/2.0.0/console.js'
    ]
};

/**
 * 判断是否内置 framework 的正则
 *
 * @type {RegExp}
 */
var isNativeReg = /^(?!https?:|[\.\/\\]{1,2})/;

/**
 * 判断是否 CSS 文件的正则
 *
 * @type {RegExp}
 */
var cssFileExt = /\.(css|styl|less|sass)$/i;

/**
 * 构建加载 CSS、JS 文件的 HTML 代码
 *
 * @param {string} path 文件路径
 * @return {string} 对应的加载资源文件的 HTML 代码
 */
function buildTag(path) {
    if (isNativeReg.test(path)) {
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
 * @param {Array.<string>} frameworks 所有指定的 frameworks 名称
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

/**
 * frameworks 的 HTML 代码缓存
 *
 * @type {string}
 */
var cached = null;

/**
 * 生成 frameworks 的 HTML 代码
 *
 * @param {Array.<string>} frameworks 配置文件中指定的 frameworks 数组
 * @return {string} frameworks 对应的资源加载 HTML 代码
 */
exports.render = function (frameworks) {
    if (!cached) {
        cached = buildFramwworks(frameworks);
    }
    return cached;
};
