;(function(jasmine) {
    var formatFailedStep = function(step) {

        var stack = step.trace.stack;
        var message = step.message;
        if(stack) {
            // remove the trailing dot
            var firstLine = stack.substring(0, stack.indexOf('\n') - 1);
            if(message && message.indexOf(firstLine) === -1) {
                stack = message + '\n' + stack;
            }

            // remove jasmine stack entries
            return stack.replace(/\n.+jasmine\.js\w*\:.+(?=(\n|$))/g, '');
        }

        return message;
    };

    var indexOf = function(collection, item) {
        if(collection.indexOf) {
            return collection.indexOf(item);
        }

        for(var i = 0, ii = collection.length; i < ii; i++) {
            if(collection[i] === item) {
                return i;
            }
        }

        return -1;
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
    }

    Reporter.prototype = {

        constructor: Reporter,

        reportRunnerStarting: function(runner) {
            this.total = runner.specs().length;
            this.socket.emit('start', this.total);
        },

        reportRunnerResults: function(runner) {
            this.socket.emit('complete', {
                coverage: window.__coverage__
            });
            this.host.done();
        },

        reportSpecStarting: function(spec) {
            spec.results_.time = +new Date();
        },

        reportSpecResults: function(spec) {

            var result = {
                id: spec.id,
                description: spec.description,
                suite: [],
                success: spec.results_.failedCount === 0,
                skipped: spec.results_.skipped,
                time: spec.results_.skipped ? 0 : new Date().getTime() - spec.results_.time,
                log: [],
                total: this.total
            };

            var suitePointer = spec.suite;
            while(suitePointer) {
                result.suite.unshift(suitePointer.description);
                suitePointer = suitePointer.parentSuite;
            }

            if(!result.success) {
                var steps = spec.results_.items_;
                for(var i = 0; i < steps.length; i++) {
                    if(!steps[i].passed_) {
                        result.log.push(formatFailedStep(steps[i]));
                    }
                }
            }

            this.socket.emit('result', result);

        },

        log: function(msg) {
            console.log(msg);
        }
    };

    jasmine.EdpReporter = Reporter;

})(jasmine);
