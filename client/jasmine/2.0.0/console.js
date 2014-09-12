;(function(jasmine) {
    var formatFailedStep = function(step) {

        var stack = step.stack;
        var message = step.message;
        if (stack) {
            // remove the trailing dot
            var firstLine = stack.substring(0, stack.indexOf('\n') - 1);
            if (message && message.indexOf(firstLine) === -1) {
                stack = message + '\n' + stack;
            }

            // remove jasmine stack entries
            return stack
                .replace(/\?[^:]+/g, '')
                .replace(/\n.+\/.edp-test\/.+\.js:.+(?=(\n|$))/g, '')
                .replace(/\n.+\/(context\.html)?\:.+(?=(\n|$))/g, '');
        }

        return message;
    };



    /**
     * 用于 edp-test 的 Reporter 简单实现
     *
     * @constructor
     * @param {Socket} socket socket.io 的实例
     */

    function Reporter(socket, host) {
        this.socket = socket;
        this.host = host;

        this.topResults = new jasmine.ResultsNode({}, '', null);
        this.currentParent = this.topResults;
    }

    Reporter.prototype = {

        constructor: Reporter,

        jasmineStarted: function(runner) {
            this.total = runner.totalSpecsDefined | 0;
            this.socket.emit('start', this.total);
        },

        jasmineDone: function(runner) {
            this.socket.emit('complete', {
                coverage: window.__coverage__
            });
            this.host.done();
        },


        suiteStarted: function (result) {
            this.currentParent.addChild(result, 'suite');
            this.currentParent = this.currentParent.last();
        },

        suiteDone: function (result) {
            if (this.currentParent !== this.topResults) {
                this.currentParent = this.currentParent.parent;
            }
        },

        specStarted: function (result) {
            this.currentParent.addChild(result, 'spec');
        },

        specDone: function(spec) {

            var result = {
                id: parseInt(spec.id.slice(4), 10),
                description: spec.description,
                suite: [],
                success: spec.status === 'passed',
                skipped: spec.status === 'pending',
                log: [],
                total: this.total
            };

            var topResults = this.topResults;
            var currentParent = this.currentParent;
            while (currentParent && currentParent !== topResults) {
                result.suite.unshift(currentParent.result.description);
                currentParent = currentParent.parent;
            }

            if (spec.status === 'failed') {
                var steps = spec.failedExpectations;
                for (var i = 0; i < steps.length; i++) {
                    result.log.push(formatFailedStep(steps[i]));
                }
            }

            this.socket.emit('result', result);
        }
    };

    jasmine.EdpReporter = Reporter;

})(window.jasmine);
