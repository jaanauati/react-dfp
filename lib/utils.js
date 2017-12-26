'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
    script.onload = function (_) {
      return resolve(window.googletag);
    };

    var _document$getElements = document.getElementsByTagName('head'),
        _document$getElements2 = _slicedToArray(_document$getElements, 1),
        firstHead = _document$getElements2[0];

    if (firstHead) {
      firstHead.appendChild(script);
    }
  });
};

var contextMapping = {
  dfpAdUnit: "adUnit",
  dfpNetworkId: "dfpNetworkId",
  dfpSizeMapping: "sizeMapping",
  dfpTargetingArguments: "targetingArguments"
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
