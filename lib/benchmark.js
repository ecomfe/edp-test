/**
 * @file Benchmark test for Node.js
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');
var marked = require('marked');
var Benchmark = require('benchmark');
var platform = require('platform');

const LINE = new Array(60).join('-');

function test(name) {
    var markdown = fs.readFileSync(path.join(process.cwd(), name)).toString('utf-8');

    var info = {
        title: '',
        cases: []
    };
    var current;
    var renderer = new marked.Renderer();
    renderer.heading = function (text, level, raw) {
        if (info.title) {
            current = {
                name: text
            };
            info.cases.push(current);
        }
        else {
            info.title = text;
        }
    };

    renderer.code = function (code, lang) {
        if (current) {
            current.fn = code;
        }
    };

    marked(markdown, {
        renderer: renderer,
        gfm: true
    });

    var suite = new Benchmark.Suite(info.title);

    info.cases.forEach(function (item) {
        suite.add(item.name, item.fn, {count: 10});
    });

    suite.on('complete', function () {
        console.log(String(platform));
        console.log();
        console.log(LINE);
        [].forEach.call(this, function (benchmark) {
            console.log(String(benchmark));
            console.log(LINE);
        });
        console.log();
        console.log('The winner is ' + this.filter('fastest').map('name'));
        console.log();
    }).run({
        async: false
    });
}

exports.run = function (args, opts) {
    args.forEach(test);
};
