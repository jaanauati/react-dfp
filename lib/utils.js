'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapContextToAdSlotProps = exports.loadGPTScript = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadGPTScript = exports.loadGPTScript = function loadGPTScript() {
  return new Promise(function (resolve, reject) {
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];

    var script = document.createElement('script');

    script.src = document.location.protocol + '//www.googletagservices.com/tag/js/gpt.js';
    script.async = true;
    script.type = 'text/javascript';

    script.onerror = function (err) {
      return reject(err);
    };

    googletag.cmd.push(function () {
      return resolve(window.googletag);
    });

    var _document$getElements = document.getElementsByTagName('head'),
        _document$getElements2 = (0, _slicedToArray3.default)(_document$getElements, 1),
        firstHead = _document$getElements2[0];

    if (firstHead) {
      firstHead.appendChild(script);
    }
  });
};

var contextMapping = {
  dfpAdUnit: 'adUnit',
  dfpNetworkId: 'dfpNetworkId',
  dfpSizeMapping: 'sizeMapping',
  dfpTargetingArguments: 'targetingArguments'
};

var mapContextToAdSlotProps = exports.mapContextToAdSlotProps = function mapContextToAdSlotProps(context) {
  var mappings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : contextMapping;
  var newProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var contextReducer = function contextReducer(acc, key) {
    if (context.hasOwnProperty(key) && context[key] !== undefined) {
      acc[mappings[key]] = context[key];
    }

    return acc;
  };

  return Object.keys(context).reduce(contextReducer, newProps);
};
