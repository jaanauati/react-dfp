function doloadGPTScript(resolve, reject) {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];

  const scriptTag = document.createElement('script');
  scriptTag.src = `${document.location.protocol}//securepubads.g.doubleclick.net/tag/js/gpt.js`;
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

export function loadGPTScript() {
  return new Promise((resolve, reject) => {
    doloadGPTScript(resolve, reject);
  });
}

let lastUrl = null;
export function correlatorUpdateUrlStrategy() {
  if (lastUrl !== window.location.pathname) {
    lastUrl = window.location.pathname;
    return true;
  }
  return false;
}
