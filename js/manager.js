import { EventEmitter } from 'events';
import * as Utils from './utils';

let loadPromise = null;
let googleGPTScriptLoadPromise = null;
let singleRequestEnabled = true;
let disableInitialLoadEnabled = false;
let lazyLoadEnabled = false;
let lazyLoadConfig = null;
let servePersonalizedAds = true;
let serveCookies = true;
const registeredSlots = {};
let managerAlreadyInitialized = false;
const globalTargetingArguments = {};
const globalAdSenseAttributes = {};
let limitedAds = false;

const DFPManager = Object.assign(new EventEmitter().setMaxListeners(0), {

  singleRequestIsEnabled() {
    return singleRequestEnabled;
  },

  configureSingleRequest(value) {
    singleRequestEnabled = !!value;
  },

  disableInitialLoadIsEnabled() {
    return disableInitialLoadEnabled;
  },

  configureDisableInitialLoad(value) {
    disableInitialLoadEnabled = !!value;
  },

  configureLazyLoad(enable = true, config = null) {
    let conf = null;
    if (config !== null && typeof config === 'object') {
      conf = { ...config };
    }
    lazyLoadEnabled = !!enable;
    lazyLoadConfig = conf;
  },

  lazyLoadIsEnabled() {
    return lazyLoadEnabled;
  },

  limitedAdsIsEnabled() {
    return limitedAds;
  },

  configureLimitedAds(value) {
    limitedAds = !!value;
  },

  getLazyLoadConfig() {
    return lazyLoadConfig;
  },

  getAdSenseAttribute(key) {
    return globalAdSenseAttributes[key];
  },

  configurePersonalizedAds(value) {
    servePersonalizedAds = value;
  },

  configureCookieOption(value) {
    serveCookies = value;
  },

  personalizedAdsEnabled() {
    return servePersonalizedAds;
  },

  cookiesEnabled() {
    return serveCookies;
  },

  setAdSenseAttribute(key, value) {
    this.setAdSenseAttributes({ [key]: value });
  },

  getAdSenseAttributes() {
    return { ...globalAdSenseAttributes };
  },

  setAdSenseAttributes(attrs) {
    Object.assign(globalAdSenseAttributes, attrs);
    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then((googletag) => {
        googletag.cmd.push(() => {
          const pubadsService = googletag.pubads();
          Object.keys(globalAdSenseAttributes).forEach(
            (key) => {
              pubadsService.set(key, globalTargetingArguments[key]);
            },
          );
        });
      });
    }
  },

  setTargetingArguments(data) {
    Object.assign(globalTargetingArguments, data);
    const availableKeys = Object.keys(registeredSlots);
    availableKeys.forEach((slotId) => {
      registeredSlots[slotId].targetingArguments = data;
    });
    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then((googletag) => {
        googletag.cmd.push(() => {
          const pubadsService = googletag.pubads();
          Object.keys(globalTargetingArguments).forEach((varName) => {
            if (pubadsService) {
              pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
            }
          });
        });
      });
    }
  },

  getTargetingArguments() {
    return { ...globalTargetingArguments };
  },

  getSlotProperty(slotId, propName) {
    const slot = this.getRegisteredSlots()[slotId];
    let ret = null;
    if (slot !== undefined) {
      ret = slot[propName] || ret;
    }
    return ret;
  },

  getSlotTargetingArguments(slotId) {
    const propValue = this.getSlotProperty(slotId, 'targetingArguments');
    return propValue ? { ...propValue } : null;
  },

  getSlotAdSenseAttributes(slotId) {
    const propValue = this.getSlotProperty(slotId, 'adSenseAttributes');
    return propValue ? { ...propValue } : null;
  },

  init() {
    if (managerAlreadyInitialized === false) {
      managerAlreadyInitialized = true;
      this.getGoogletag().then((googletag) => {
        googletag.cmd.push(() => {
          const pubadsService = googletag.pubads();
          pubadsService.addEventListener('slotRenderEnded', (event) => {
            const slotId = event.slot.getSlotElementId();
            this.emit('slotRenderEnded', { slotId, event });
          });
          pubadsService.addEventListener('impressionViewable', (event) => {
            const slotId = event.slot.getSlotElementId();
            this.emit('impressionViewable', { slotId, event });
          });
          pubadsService.addEventListener('slotVisibilityChanged', (event) => {
            const slotId = event.slot.getSlotElementId();
            this.emit('slotVisibilityChanged', { slotId, event });
          });
          pubadsService.setRequestNonPersonalizedAds(
            this.personalizedAdsEnabled() ? 0 : 1,
          );
          pubadsService.setCookieOptions(
            this.cookiesEnabled() ? 0 : 1,
          );
        });
      });
    }
  },

  getGoogletag() {
    if (googleGPTScriptLoadPromise === null) {
      googleGPTScriptLoadPromise = Utils.loadGPTScript(limitedAds);
    }
    return googleGPTScriptLoadPromise;
  },

  setCollapseEmptyDivs(collapse) {
    this.collapseEmptyDivs = collapse;
  },

  load(...slots) {
    if (loadPromise === null) {
      loadPromise = this.doLoad(...slots);
    } else {
      loadPromise = loadPromise.then(
        () => this.doLoad(...slots),
      );
    }
  },

  doLoad(...slots) {
    this.init();
    let availableSlots = {};

    if (slots.length > 0) {
      availableSlots = slots.filter(
        slotId => Object.prototype.hasOwnProperty.call(registeredSlots, slotId),
      );
    } else {
      availableSlots = Object.keys(registeredSlots);
    }
    availableSlots = availableSlots.filter(
      id => !registeredSlots[id].loading && !registeredSlots[id].gptSlot,
    );
    availableSlots.forEach((slotId) => {
      registeredSlots[slotId].loading = true;
    });
    return this.gptLoadAds(availableSlots);
  },

  gptLoadAds(slotsToInitialize) {
    return new Promise((resolve) => {
      this.getGoogletag().then((googletag) => {
        this.configureInitialOptions(googletag);
        slotsToInitialize.forEach((currentSlotId) => {
          registeredSlots[currentSlotId].loading = false;

          googletag.cmd.push(() => {
            const slot = registeredSlots[currentSlotId];
            let gptSlot;
            const adUnit = `${slot.dfpNetworkId}/${slot.adUnit}`;
            if (slot.renderOutOfThePage === true) {
              gptSlot = googletag.defineOutOfPageSlot(adUnit, currentSlotId);
            } else {
              gptSlot = googletag.defineSlot(adUnit, slot.sizes, currentSlotId);
            }
            if (gptSlot !== null) {
              slot.gptSlot = gptSlot;
              const slotTargetingArguments = this.getSlotTargetingArguments(currentSlotId);
              if (slotTargetingArguments !== null) {
                Object.keys(slotTargetingArguments).forEach((varName) => {
                  if (slot && slot.gptSlot) {
                    slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
                  }
                });
              }
              const slotAdSenseAttributes = this.getSlotAdSenseAttributes(currentSlotId);
              if (slotAdSenseAttributes !== null) {
                Object.keys(slotAdSenseAttributes).forEach((varName) => {
                  slot.gptSlot.set(varName, slotAdSenseAttributes[varName]);
                });
              }
              slot.gptSlot.addService(googletag.pubads());
              if (slot.sizeMapping) {
                let smbuilder = googletag.sizeMapping();
                slot.sizeMapping.forEach((mapping) => {
                  smbuilder = smbuilder.addSize(mapping.viewport, mapping.sizes);
                });
                slot.gptSlot.defineSizeMapping(smbuilder.build());
              }
            }
          });
        });
        this.configureOptions(googletag);
        googletag.cmd.push(() => {
          googletag.enableServices();
          slotsToInitialize.forEach((theSlotId) => {
            googletag.display(theSlotId);
          });
          resolve();
        });
      });
    });
  },

  // configure those gpt parameters that need to be set before pubsads service
  // initialization.
  configureInitialOptions(googletag) {
    googletag.cmd.push(() => {
      if (this.disableInitialLoadIsEnabled()) {
        googletag.pubads().disableInitialLoad();
      }
    });
  },

  configureOptions(googletag) {
    googletag.cmd.push(() => {
      const pubadsService = googletag.pubads();
      pubadsService.setRequestNonPersonalizedAds(
        this.personalizedAdsEnabled() ? 0 : 1,
      );
      pubadsService.setCookieOptions(
        this.cookiesEnabled() ? 0 : 1,
      );
      const targetingArguments = this.getTargetingArguments();
      // set global targetting arguments
      Object.keys(targetingArguments).forEach((varName) => {
        if (pubadsService) {
          pubadsService.setTargeting(varName, targetingArguments[varName]);
        }
      });
      // set global adSense attributes
      const adSenseAttributes = this.getAdSenseAttributes();
      Object.keys(adSenseAttributes).forEach((key) => {
        pubadsService.set(key, adSenseAttributes[key]);
      });
      if (this.lazyLoadIsEnabled()) {
        const config = this.getLazyLoadConfig();
        if (config) {
          pubadsService.enableLazyLoad(config);
        } else {
          pubadsService.enableLazyLoad();
        }
      }
      if (this.singleRequestIsEnabled()) {
        pubadsService.enableSingleRequest();
      }
      if (this.collapseEmptyDivs === true || this.collapseEmptyDivs === false) {
        pubadsService.collapseEmptyDivs(this.collapseEmptyDivs);
      }
    });
  },

  getRefreshableSlots(...slotsArray) {
    const slots = {};
    if (slotsArray.length === 0) {
      const slotsToRefresh = Object.keys(registeredSlots)
        .map(k => registeredSlots[k]);
      return slotsToRefresh.reduce((last, slot) => {
        if (slot.slotShouldRefresh() === true) {
          slots[slot.slotId] = slot;
        }
        return slots;
      }, slots);
    }
    return slotsArray.reduce((last, slotId) => {
      const slot = registeredSlots[slotId];
      if (typeof slot !== 'undefined') {
        slots[slotId] = slot;
      }
      return slots;
    }, slots);
  },

  refresh(...slots) {
    if (loadPromise === null) {
      this.load();
    } else {
      loadPromise.then(() => {
        this.gptRefreshAds(
          Object.keys(
            this.getRefreshableSlots(...slots),
          ),
        );
      });
    }
  },

  gptRefreshAds(slots) {
    return this.getGoogletag().then((googletag) => {
      this.configureOptions(googletag);
      googletag.cmd.push(() => {
        const pubadsService = googletag.pubads();
        const slotsToRefreshArray = slots.map(slotId => registeredSlots[slotId].slotId);
        pubadsService.refresh(slotsToRefreshArray);
      });
    });
  },

  reload(...slots) {
    return this.destroyGPTSlots(...slots).then(() => this.load());
  },

  destroyGPTSlots(...slotsToDestroy) {
    if (slotsToDestroy.length === 0) {
      // eslint-disable-next-line no-param-reassign
      slotsToDestroy = Object.keys(registeredSlots);
    }
    return new Promise((resolve) => {
      const slots = [];
      const gptSlots = [];
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const idx in slotsToDestroy) {
        const slotId = slotsToDestroy[idx];
        const slot = registeredSlots[slotId];
        slots.push(slot);
      }
      this.getGoogletag()
        .then((googletag) => {
          googletag.cmd.push(() => {
            if (managerAlreadyInitialized === true) {
              if (slotsToDestroy.length > 0) {
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (const idx in slots) {
                  const slot = slots[idx];
                  if (slot?.gptSlot) {
                    gptSlots.push(slot.gptSlot);
                    delete slot.gptSlot;
                  }
                }
                googletag.destroySlots(gptSlots);
              } else {
                googletag.destroySlots();
              }
            }
            resolve(slotsToDestroy);
          });
        });
    });
  },

  registerSlot({
    slotId,
    dfpNetworkId,
    adUnit,
    sizes,
    renderOutOfThePage,
    sizeMapping,
    adSenseAttributes,
    targetingArguments,
    slotShouldRefresh,
  }, autoLoad = true) {
    if (!Object.prototype.hasOwnProperty.call(registeredSlots, slotId)) {
      registeredSlots[slotId] = {
        slotId,
        sizes,
        renderOutOfThePage,
        dfpNetworkId,
        adUnit,
        adSenseAttributes,
        targetingArguments,
        sizeMapping,
        slotShouldRefresh,
        loading: false,
      };
      this.emit('slotRegistered', { slotId });
      if (autoLoad === true && loadPromise !== null) {
        loadPromise = loadPromise.catch().then(() => {
          const slot = registeredSlots[slotId];
          if (typeof slot !== 'undefined') {
            const { loading, gptSlot } = slot;
            if (loading === false && !gptSlot) {
              this.load(slotId);
            }
          }
        });
      }
    }
  },

  unregisterSlot({ slotId }) {
    this.destroyGPTSlots(slotId);
    delete registeredSlots[slotId];
  },

  getRegisteredSlots() {
    return registeredSlots;
  },

  attachSlotRenderEnded(cb) {
    this.on('slotRenderEnded', cb);
  },

  detachSlotRenderEnded(cb) {
    this.removeListener('slotRenderEnded', cb);
  },

  attachSlotVisibilityChanged(cb) {
    this.on('slotVisibilityChanged', cb);
  },

  detachSlotVisibilityChanged(cb) {
    this.removeListener('slotVisibilityChanged', cb);
  },

  attachSlotIsViewable(cb) {
    this.on('impressionViewable', cb);
  },

  detachSlotIsViewable(cb) {
    this.removeListener('impressionViewable', cb);
  },

});

export default DFPManager;
