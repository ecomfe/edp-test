/**
 * @file sourceMap 的 coverage 转换
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');

var SourceMapConsumer = require('source-map-closest-match').SourceMapConsumer;

function getFilePath(source, generatorPrefix) {
    source = source || '';
    if (source && generatorPrefix) {
        source = source.replace(generatorPrefix, '');
    }

    return path.resolve(source.replace(/\?.*$/, ''));
}

function prepareCoverageObjForFile(origFilePath, listCode, translated, origFileCtrMap) {
    if (!translated.hasOwnProperty(origFilePath)) {
        // setup coverage object for file
        translated[origFilePath] = {
            path: origFilePath,
            s: {},
            b: {},
            f: {},
            fnMap: {},
            statementMap: {},
            branchMap: {}
        };
        // setup counters
        origFileCtrMap[origFilePath] = {};
        origFileCtrMap[origFilePath].s = 0;
        origFileCtrMap[origFilePath].b = 0;
        origFileCtrMap[origFilePath].f = 0;
    }
    // get next statement number for original file (counter)
    origFileCtrMap[origFilePath][listCode]++;

    // No return - arguments passed by reference
}

function translateStatement(statementList, statementMapList, consumer, options, translated, origFileCtrMap) {

    for (var statement in statementList) {
        if (statementList.hasOwnProperty(statement)) {
            var statementMap = statementMapList[statement];

            // get original file and line and column - convert statementMap object
            var origStartPos = consumer.originalPositionFor({
                line: statementMap.start.line,
                column: statementMap.start.column
            });
            var origEndPos = consumer.originalPositionFor({
                line: statementMap.end.line,
                column: statementMap.end.column
            });

            var origFilePath = getFilePath(origStartPos.source, options.generatorPrefix);

            // if file exists and if start filepath source equals end filepath source then add to coverage.
            if (fs.existsSync(origFilePath) && origStartPos.source === origEndPos.source) {

                // check if we've started translating this file
                // if not then prepare translation coverage object for file and file counters
                // increment statement counter 's'
                prepareCoverageObjForFile(origFilePath, 's', translated, origFileCtrMap);

                // add statement and statementMap to translated coverage object for file
                translated[origFilePath].s[origFileCtrMap[origFilePath].s] = statementList[statement];

                translated[origFilePath].statementMap[origFileCtrMap[origFilePath].s] = {
                    start: {
                        line: origStartPos.line,
                        column: origStartPos.column
                    },
                    end: {
                        line: origEndPos.line,
                        column: origEndPos.column
                    }
                };
            }
        }
    }
}

function translateBranch(branchList, branchMapList, consumer, options, translated, origFileCtrMap) {

    for (var branch in branchList) {
        if (branchList.hasOwnProperty(branch)) {
            var branchMap = branchMapList[branch];

            // get original file and line and column - convert statementMap object
            var origPos = consumer.originalPositionFor({
                line: branchMap.line,
                column: 0
            });
            var origFilePath = getFilePath(origPos.source, options.generatorPrefix);

            // if file exists then add to coverage.
            if (fs.existsSync(origFilePath)) {
                // check if we've started translating this file
                // if not then prepare translation coverage object for file and file counters
                // increment branch counter 'b'
                prepareCoverageObjForFile(origFilePath, 'b', translated, origFileCtrMap);

                // add branch and branchMap to translated coverage object for file
                translated[origFilePath].b[origFileCtrMap[origFilePath].b] = branchList[branch];

                translated[origFilePath].branchMap[origFileCtrMap[origFilePath].b] = {
                    line: origPos.line,
                    type: branchMap.type,
                    locations: []
                };

                var origStartPos;
                var origEndPos;
                var branchLocation;
                // add locations
                for (var locCtr = 0; locCtr < branchMap.locations.length; locCtr = locCtr + 1) {
                    branchLocation = branchMap.locations[locCtr];

                    origStartPos = consumer.originalPositionFor(branchLocation.start);
                    origEndPos = consumer.originalPositionFor(branchLocation.end);

                    translated[origFilePath].branchMap[origFileCtrMap[origFilePath].b].locations[locCtr] = {
                        start: {
                            line: origStartPos.line,
                            column: origStartPos.column
                        },
                        end: {
                            line: origEndPos.line,
                            column: origEndPos.column
                        }
                    };
                }
            }
        }
    }
}

function translateFn(fnList, fnMapList, consumer, options, translated, origFileCtrMap) {

    for (var fn in fnList) {
        if (fnList.hasOwnProperty(fn)) {

            var fnMap = fnMapList[fn];

            // get original file and line and column - convert statementMap object
            var origPos = consumer.originalPositionFor({
                line: fnMap.line,
                column: 0
            });
            var origStartPos = consumer.originalPositionFor(fnMap.loc.start);
            var origEndPos = consumer.originalPositionFor(fnMap.loc.end);

            var origFilePath = getFilePath(origPos.source, options.generatorPrefix);

            // if file exists and if start filepath source equals end filepath source then add to coverage.
            if (fs.existsSync(origFilePath) && origStartPos.source === origEndPos.source) {

                // check if we've started translating this file
                // if not then prepare translation coverage object for file and file counters
                // increment statement counter 's'
                prepareCoverageObjForFile(origFilePath, 'f', translated, origFileCtrMap);

                // add statement and statementMap to translated coverage object for file
                translated[origFilePath].f[origFileCtrMap[origFilePath].f] = fnList[fn];

                translated[origFilePath].fnMap[origFileCtrMap[origFilePath].f] = {
                    name: fnMap.name,
                    line: origPos.line,
                    loc: {
                        start: {
                            line: origStartPos.line,
                            column: origStartPos.column
                        },
                        end: {
                            line: origEndPos.line,
                            column: origEndPos.column
                        }
                    }
                };
            }
        }
    }
}

function translate(coverObject, sourceMap, options, translated, origFileCtrMap) {
    var consumer = new SourceMapConsumer(sourceMap);

    // get references
    var branchList       = coverObject.b;
    var statementList    = coverObject.s;
    var fnList           = coverObject.f;
    var fnMapList        = coverObject.fnMap;
    var branchMapList    = coverObject.branchMap;
    var statementMapList = coverObject.statementMap;

    translateFn(fnList, fnMapList, consumer, options, translated, origFileCtrMap);
    translateBranch(branchList, branchMapList, consumer, options, translated, origFileCtrMap);
    translateStatement(statementList, statementMapList, consumer, options, translated, origFileCtrMap);
}

/**
 * 根据 sourcemap 转换代码覆盖率数据为编译前代码位置
 *
 * @param {Object} coverage istanbul 的代码覆盖率数据对象
 * @param {Object} options 可选配置项
 * @param {?string} options.generatorPrefix the protocol prefix added to the path
 * for original sources by the source map generator.
 * @param {Object} options.sourceMaps an object array of source-map file mappings.
 * If not provided the module will look for a source map in the same directory as the covered source file
 * with the suffix `.map`.
 *
 * @example
 * {
 *  './file1.js': './file1.js.map',
 *  './file2.js': './maps/file2.js.map'
 * }
 * @return {Object} translated coverage object
 */
module.exports = function (coverage, options) {
    if (typeof coverage === 'string' || coverage instanceof String) {
        coverage = JSON.parse(coverage);
    }

    options = options || {};
    options.generatorPrefix = options.generatorPrefix || '';
    options.sourceMaps = options.sourceMaps || false;

    // for each file in coverage object
    var translated = {};
    var origFileCtrMap = {};
    var translating = false;

    for (var fileName in coverage) {
        if (coverage.hasOwnProperty(fileName)) {
            var coverObject = coverage[fileName];
            var filePath = coverObject.path;

            var sourceMap;

            if (options.sourceMaps) {
                sourceMap = options.sourceMaps[filePath] || (filePath + '.map');
            }

            if (sourceMap) {

                translating = true;

                if (typeof sourceMap === 'string') {
                    sourceMap = JSON.parse(fs.readFileSync(sourceMap, 'utf-8'));
                }

                var sourceMapFile = sourceMap.file;
                // fix unknown in file and sources field
                if (sourceMapFile === 'unknown') {
                    sourceMapFile = filePath;
                }
                else if (/^(?![\/\\]|[A-Z]:)/i.test(sourceMapFile)) {
                    sourceMapFile = path.resolve(path.dirname(filePath), sourceMapFile);
                }

                sourceMap.file = sourceMap.sources[0] = sourceMapFile;

                translate(coverObject, sourceMap, options, translated, origFileCtrMap);
            }

        }
    }

    return translating ? translated : coverage;
};
