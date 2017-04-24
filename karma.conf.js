module.exports = function karmaConfig(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      'lib/*.js',
      'spec/*.js',
    ],
    preprocessors: {
      'lib/*.js': ['browserify'],
      'spec/*.js': ['browserify'],
    },
    browserify: {
      debug: true,
      configure: function browserify(bundle) {
        bundle.once('prebundle', () => {
          bundle.transform('babelify', { presets: ['es2015', 'react'] });
        });
      },
    },
    client: {
      captureConsole: true,
    },
    reporters: ['mocha'],
    port: 9877,
    colors: true,
    autoWatch: false,
    browsers: ['jsdom'],
    singleRun: true,
    browserNoActivityTimeout: 2000,
  });
};
