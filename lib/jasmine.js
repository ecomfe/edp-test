/**
 * @file jasmine-node 代理
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');

var edp = require('edp-core');


var TEST_DIR = 'test';
var JASMINE_MAP = (function () {
    var map = {valid: []};
    function detect(dirpath) {
        dirpath = path.resolve(dirpath, 'jasmine-node');

        if (fs.existsSync(dirpath)) {
            var pkg = require(path.resolve(dirpath, 'package.json'));
            var version = pkg.version;
            var versions = version.split('.');

            map[dirpath] = version;
            map[version] = map[version] || dirpath;
            map[versions[0]] = map[versions[0]] || dirpath;

            map.valid.push(dirpath);
        }
    }

    [
        path.resolve(process.cwd(), 'node_modules'),
        path.resolve(__dirname, '..', 'node_modules'),
        process.env.NODE_PATH
    ].forEach(detect);

    return map;
})();


var jasmines = {
    istanbul: function (version, config) {
        require('istanbul/lib/register-plugins');
        var cover = require('istanbul/lib/command').create('cover');

        var args = ['--print', 'none'];

        var reporter = config.coverageReporter || {};
        (reporter.type || 'text|html').split('|').forEach(function (report) {
            args.push('--report', report);
        });

        if (reporter.dir) {
            args.push('--dir', reporter.dir);
        }

        (reporter.exclude || []).forEach(function (pattern) {
            args.push('-x', pattern);
        });

        args.push(path.resolve(JASMINE_MAP[version], 'bin/jasmine-node'), '--captureExceptions');
        args.push.apply(args, edp.glob.sync([TEST_DIR + '/**/*{s,S}pec.js'], {nodir: true}));

        cover.run(args, function (err) {
            process.exit(err ? 1 : 0);
        });
    },

    1: {
        debug: function (config) {
            var jasmine = require(JASMINE_MAP[1]);

            var onComplete = function (runner, log) {
                process.stdout.write('\n');
                if (config.singleRun) {
                    process.exit(runner.results().failedCount ? 1 : 0);
                }
            };

            var options = {
                specFolders: [TEST_DIR],
                onComplete: onComplete,
                isVerbose: false,
                showColors: true,
                teamcity: false,
                useRequireJs: false,
                junitreport: false,
                includeStackTrace: true,
                growl: true
            };

            jasmine.executeSpecsInFolder(options);
        },

        cover: function (config) {
            jasmines.istanbul(1, config);
        }
    },

    2: {
        debug: function (config) {
            var jasmine = require(JASMINE_MAP[2]);

            var options = edp.util.mix(jasmine.defaults, {
                forceExit: config.singleRun,
                watchFolders: config.watch ? [TEST_DIR] : [],
                specFolders: [TEST_DIR]
            });

            jasmine.run(options);
        },

        cover: function (config) {
            jasmines.istanbul(2, config);
        }
    }
};


exports.run = function (config) {
    var version = config.jasmine || !config.noUserConfig && (config.frameworks || []).map(function (name) {
        return name.indexOf('jasmine') === 0 ? (name.slice(7) || 1) : 0;
    })[0] || (JASMINE_MAP[JASMINE_MAP.valid[0]] || '').split('.')[0];

    var jasmine = jasmines[version];
    if (!jasmine) {
        throw new Error('Invalid jasmine version: ' + version);
    }

    jasmine[config.debug ? 'debug' : 'cover'](config);
};
