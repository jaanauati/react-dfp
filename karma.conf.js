module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'jasmine'],
    files: [
      'spec/*.js',
      'lib/*.js',
    ],
    preprocessors: {
      'spec/*.js': [ 'browserify'],
      'lib/*.js': [ 'browserify'],
    },
    browserify: {
      configure: function browserify(bundle) {
        bundle.once('prebundle', function prebundle() {
          bundle.transform('babelify', { presets: ['es2015', 'react'] });
        });
      },
    },
    client: {
      captureConsole: true,
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
  });
};