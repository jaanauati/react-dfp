'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadGPTScript = loadGPTScript;
function doloadGPTScript(resolve, reject) {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];

  var scriptTag = document.createElement('script');
  scriptTag.src = document.location.protocol + '//www.googletagservices.com/tag/js/gpt.js';
  scriptTag.async = true;
  scriptTag.type = 'text/javascript';
  scriptTag.onerror = function scriptTagOnError(errs) {
    reject(errs);
  };
  scriptTag.onload = function scriptTagOnLoad() {
    resolve(window.googletag);
  };
  document.getElementsByTagName('head')[0].appendChild(scriptTag);
}

function loadGPTScript() {
  return new Promise(function (resolve, reject) {
    doloadGPTScript(resolve, reject);
  });
}
