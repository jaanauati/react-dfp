"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestIdleCallback = void 0;

var getRequestIdleCallback = function getRequestIdleCallback() {
  var fallback = function fallback(handler) {
    var startTime = Date.now();
    return setTimeout(function () {
      handler({
        didTimeout: false,
        timeRemaining: function timeRemaining() {
          return Math.max(0, 50.0 - (Date.now() - startTime));
        }
      });
    }, 1);
  };

  return window.requestIdleCallback || fallback;
};

exports.getRequestIdleCallback = getRequestIdleCallback;