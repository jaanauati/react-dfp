"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadGPTScript = loadGPTScript;

var _idletimeoutShim = require("./idletimeout-shim");

var GPT_SRC = {
  standard: 'securepubads.g.doubleclick.net',
  limitedAds: 'pagead2.googlesyndication.com'
};

function doloadGPTScript(resolve, reject, limitedAds, timerId) {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];
  var scriptTag = document.createElement('script');
  scriptTag.src = "".concat(document.location.protocol, "//").concat(limitedAds ? GPT_SRC.limitedAds : GPT_SRC.standard, "/tag/js/gpt.js");
  scriptTag.async = true;
  scriptTag.type = 'text/javascript';

  scriptTag.onerror = function scriptTagOnError(errs) {
    reject(errs);
  };

  scriptTag.onload = function scriptTagOnLoad() {
    resolve(window.googletag);
  };

  document.getElementsByTagName('head')[0].appendChild(scriptTag);
  clearTimeout(timerId);
}

function loadGPTScript() {
  var limitedAds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return new Promise(function (resolve, reject) {
    var timerId = setTimeout(function () {
      doloadGPTScript(resolve, reject, limitedAds, timerId);
    }, 8000);
  });
}