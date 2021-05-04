import { getRequestIdleCallback } from './idletimeout-shim';

const GPT_SRC = {
  standard: 'securepubads.g.doubleclick.net',
  limitedAds: 'pagead2.googlesyndication.com',
};

function doloadGPTScript(resolve, reject, limitedAds) {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];

  const scriptTag = document.createElement('script');
  scriptTag.src = `${document.location.protocol}//${limitedAds ? GPT_SRC.limitedAds : GPT_SRC.standard}/tag/js/gpt.js`;
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

export function loadGPTScript(limitedAds = false) {
  return new Promise((resolve, reject) => {
    // TODO: Implement cancel timeout shim
    window.requestIdleCallback = getRequestIdleCallback();
    window.requestIdleCallback(() => doloadGPTScript(resolve, reject, limitedAds), 8000);
  });
}
