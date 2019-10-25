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

function doLoadAmazonScript(amazonConfig, resolve, reject) {
  // Load the APS JavaScript Library
  try {
    !function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");
  } catch (error) {
    reject(error);
  }
  window.apstag.init(amazonConfig, () => {
    resolve(window.apstag);
  });
}

export function loadGPTScript() {
  return new Promise((resolve, reject) => {
    doloadGPTScript(resolve, reject);
  });
}

export function loadAmazonScript(amazonConfig) {
  return new Promise((resolve, reject) => {
    doLoadAmazonScript(amazonConfig, resolve, reject);
  });
}
