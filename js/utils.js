function doloadGPTScript(resolve, reject) {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];

  const scriptTag = document.createElement('script');
  scriptTag.src = `${document.location.protocol}//www.googletagservices.com/tag/js/gpt.js`;
  scriptTag.async = true;
  scriptTag.type = 'text/javascript';
  scriptTag.onerror = function scriptTagOnError(errs) {
    reject(errs);
  };
  scriptTag.onload = function scriptTagOnLoad() {
    resolve();
  };
  document.getElementsByTagName('head')[0].appendChild(scriptTag);
}

export function loadGPTScript() {
  return new Promise((resolve, reject) => {
    doloadGPTScript(resolve, reject);
  });
}

let docIsReady = null;
export function onDocumentReady() {
  if (docIsReady === null) {
    docIsReady = new Promise((resolve) => {
      if (document.readyState !== 'loading') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', ()=> resolve());
      }
    });
  }
  return docIsReady;
}

