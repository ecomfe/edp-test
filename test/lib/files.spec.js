/**
 * @file 文件选择测试
 * @author chris[wfsr@foxmail.com]
 **/

var fs = require('fs');
var path = require('path');
var files = require('../../lib/files');

function rmdir(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                rmdir(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

describe('文件匹配', function () {

    var tempDir = '.tmp';
    var jsDir = tempDir + '/js';
    var cssDir = tempDir + '/css';
    beforeEach(function () {
        rmdir(tempDir);
        fs.mkdirSync(tempDir);
        fs.mkdirSync(cssDir);
        fs.mkdirSync(jsDir);

        for (var i = 0; i < 5; i++) {
            fs.writeFileSync(cssDir + '/' + i + '.css', '* {}');
        }

        for (var i = 0; i < 10; i++) {
            fs.writeFileSync(jsDir + '/' + i + '.js', 'console.log(true)');
        }
    });

    afterEach(function () {
        rmdir(tempDir);
    });

    it('无匹配', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.foo']);
        expect(resolveFiles.css.length).toBe(0);  
        expect(resolveFiles.js.length).toBe(0);  
    });

    it('匹配 css', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.css']);
        expect(resolveFiles.css.length).toBe(5);  
    });

    it('匹配 js', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.js']);
        expect(resolveFiles.js.length).toBe(10);  
    });

    it('匹配并排除 css', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.css'], ['.tmp/**/{2,3,4}.css']);
        expect(resolveFiles.css.length).toBe(2);  
    });

    it('匹配并排除 js', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.js'], ['.tmp/**/{8,9}.js']);
        expect(resolveFiles.js.length).toBe(8);  
    });

    it('全部匹配', function () {
        var resolveFiles = files.readAll(['.tmp/**/*.*']);
        expect(resolveFiles.js.length).toBe(10);  
        expect(resolveFiles.css.length).toBe(5);  
    });

    it('合并匹配排除', function () {
        var resolveFiles = files.readAll(
            ['.tmp/**/*.js', '.tmp/**/*.css'],
            ['.tmp/**/{6,3,2,5}.js', '.tmp/**/{2,3}.css']
        );
        expect(resolveFiles.js.length).toBe(6);  
        expect(resolveFiles.css.length).toBe(3);  
    });
});