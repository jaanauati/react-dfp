export const loadGPTScript = () => new Promise((resolve, reject) => {
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];

  const script = document.createElement('script');
  script.src = `${document.location.protocol}//www.googletagservices.com/tag/js/gpt.js`;
  script.async = true;
  script.type = 'text/javascript';

  script.onerror = err => reject(err);

  window.googletag.cmd.push(() => resolve(window.googletag));

  const [firstHead] = document.getElementsByTagName('head');

  if (firstHead) {
    firstHead.appendChild(script);
  }
});

const contextMapping = {
  dfpAdUnit: 'adUnit',
  dfpNetworkId: 'dfpNetworkId',
  dfpSizeMapping: 'sizeMapping',
  dfpTargetingArguments: 'targetingArguments',
};

export const mapContextToAdSlotProps = (context, mappings = contextMapping, newProps = {}) => {
  const contextReducer = (acc, key) => {
    if (context.hasOwnProperty(key) && context[key] !== undefined) {
      acc[mappings[key]] = context[key];
    }

    return acc;
  };

  return Object.keys(context).reduce(contextReducer, newProps);
};
