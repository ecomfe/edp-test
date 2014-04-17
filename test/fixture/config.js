// Test configuration for edp-test 
// Generated on Tue Mar 18 2014 15:22:15 GMT+0800 (CST)
module.exports = {

    foo: 'bar',

    // list of files / patterns to load in the browser
    files: [
      'src/**/*.less',
      'test/**/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
      'test/**/{ScrollBar,FloatTip}Spec.js'      
    ],


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: [/*'Chrome', 'Firefox', 'Safari', */"PhantomJS"],

    plugins: [
        'karma-jasmine', 'karma-chrome-launcher', "karma-less-preprocessor", "karma-stylus-preprocessor", 'karma-requirejs', 'karma-coverage'
    ]
};
