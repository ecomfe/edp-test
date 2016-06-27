/**
 * @file hook esnext.checkNext in eslint.js
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');

var modules = path.join(__dirname, '../node_modules/');
var innerMode = fs.existsSync(path.join(modules, 'benchmark/node_modules/lodash/'));
var lodashPath = path.join(modules, innerMode ? 'benchmark/node_modules' : '', 'lodash/lodash.min.js');

// for lodash 3.x
if (!fs.existsSync(lodashPath)) {
    lodashPath = path.join(modules, innerMode ? 'benchmark/node_modules' : '', 'lodash/index.js');
}

var dist = path.join(modules, '../client/benchmark/');
var paths = {
    lodash: lodashPath,
    benchmark: path.join(modules, 'benchmark/benchmark.js'),
    platform: path.join(modules, 'platform/platform.js')
};

Object.keys(paths).forEach(function (key) {
    console.log('Generate %s...', key);

    var code = fs.readFileSync(paths[key], 'utf-8');
    fs.writeFileSync(path.join(dist, key) + '.js', code, 'utf-8');

    console.log('finish.');
});
