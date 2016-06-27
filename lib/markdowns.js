/**
 * @file 匹配的文件
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');
var marked = require('marked');

var edp  = require('edp-core');
var glob = edp.glob;


exports.read = function test(filename) {
    var markdown = fs.readFileSync(filename).toString('utf-8');

    var file = {
        title: '',
        style: [],
        html: [],
        js: [],
        cases: []
    };

    var current;
    var renderer = new marked.Renderer();
    renderer.heading = function (text, level, raw) {
        if (file.title) {
            current = {
                name: text,
                style: [],
                html: [],
                js: []
            };
            file.cases.push(current);
        }
        else {
            file.title = text;
        }
    };

    renderer.code = function (code, lang) {
        lang = {javascript: 'js', css: 'style'}[lang] || lang;

        (current || file)[lang].push(code);
    };

    marked(markdown, {
        renderer: renderer,
        gfm: true
    });

    return file;
};

/**
 * 根据扩展名判断是否 Markdown 文件
 *
 * @param {string} path 文件路径
 * @return {boolean} 判断结果
 */
function isMarkdown(path) {
    return /\.(md|markdown)$/i.test(path);
}

/**
 * 列出所有匹配的文件，并剔除排除的文件。
 *
 * @param {Array.<string>} args markdown 文件列表
 * @return {Object} 匹配的对象，包含 js 和 css 字段的数组
 */
exports.readAll = function (args) {

    var list = glob.sync(args, {nodir: true});
    var root = process.cwd();

    var files = list.reduce(function (files, filename) {
        if (isMarkdown(filename)) {
            filename = path.join(root, filename);
            var key = path.relative(root, filename);
            files[key] = exports.read(filename);
        }
        return files;
    }, {});

    return files;
};
