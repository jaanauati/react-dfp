// Karma tests: webpack was replaced with esbuild (karma-esbuild). `npm run build` still uses Vite.
const path = require('path');

const libResolvePlugin = {
  name: 'karma-resolve-lib-to-js',
  setup(build) {
    build.onResolve({ filter: /^\.\.\/lib$/ }, (args) => ({
      path: path.resolve(__dirname, 'js/index.js'),
    }));
  },
};

module.exports = function karmaConfig(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-esbuild'),
      require('karma-jasmine'),
      require('karma-mocha-reporter'),
      require('karma-jsdom-launcher'),
    ],
    // test-manager must run before specs that call load(); otherwise loadPromise can stay
    // chained behind a pending getGoogletag() (GPT script never finishes loading in jsdom).
    files: [
      'spec/test-manager.js',
      'spec/test-adslot.js',
      'spec/test-dfpslotsprovider.js',
    ],
    preprocessors: {
      'spec/*.js': ['esbuild'],
    },
    esbuild: {
      singleBundle: true,
      jsx: 'automatic',
      loader: {
        '.js': 'jsx',
      },
      plugins: [libResolvePlugin],
    },
    client: {
      captureConsole: true,
      jasmine: {
        random: false,
      },
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
