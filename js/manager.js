import { EventEmitter } from 'events';
import * as Utils from './utils';

let loadAlreadyCalled = false;
let loadInProgress = false;
let loadPromise = null;
let googleGPTScriptLoadPromise = null;
let singleRequestEnabled = true;
let servePersonalizedAds = true;
const registeredSlots = {};
let managerAlreadyInitialized = false;
const globalTargetingArguments = {};
const globalAdSenseAttributes = {};

const DFPManager = Object.assign(new EventEmitter().setMaxListeners(0), {

  singleRequestIsEnabled() {
    return singleRequestEnabled;
  },

  configureSingleRequest(value) {
    singleRequestEnabled = !!value;
  },

  getAdSenseAttribute(key) {
    return globalAdSenseAttributes[key];
  },

  configurePersonalizedAds(value) {
    servePersonalizedAds = value;
  },

  personalizedAdsEnabled() {
    return servePersonalizedAds;
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
          pubadsService.setRequestNonPersonalizedAds(
            this.personalizedAdsEnabled() ? 0 : 1,
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
        });
      });
    }
  },

  getGoogletag() {
    if (googleGPTScriptLoadPromise === null) {
      googleGPTScriptLoadPromise = Utils.loadGPTScript();
    }
    return googleGPTScriptLoadPromise;
  },

  setCollapseEmptyDivs(collapse) {
    this.collapseEmptyDivs = collapse;
  },

  load(slotId) {
    if (loadInProgress === true || loadPromise !== null) {
      loadPromise = loadPromise.then(
        () => this.doLoad(slotId),
      );
    } else {
      loadPromise = this.doLoad(slotId);
    }
  },

  doLoad(slotId) {
    loadInProgress = true;
    this.init();
    let availableSlots = {};

    if (loadAlreadyCalled === true) {
      const slot = registeredSlots[slotId];
      if (slot !== undefined) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = registeredSlots;
    }

    availableSlots = Object.keys(availableSlots)
      .filter(id => !availableSlots[id].loading && !availableSlots[id].gptSlot)
      .reduce(
        (result, id) => Object.assign(
          result, {
            [id]: Object.assign(availableSlots[id], { loading: true }),
          },
        ), {},
      );

    return this.getGoogletag().then((googletag) => {
      Object.keys(availableSlots).forEach((currentSlotId) => {
        availableSlots[currentSlotId].loading = false;

        googletag.cmd.push(() => {
          const slot = availableSlots[currentSlotId];
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

      googletag.cmd.push(() => {
        if (this.singleRequestIsEnabled()) {
          googletag.pubads().enableSingleRequest();
        }

        if (this.collapseEmptyDivs === true || this.collapseEmptyDivs === false) {
          googletag.pubads().collapseEmptyDivs(this.collapseEmptyDivs);
        }

        googletag.enableServices();
        Object.keys(availableSlots).forEach((theSlotId) => {
          googletag.display(theSlotId);
        });
        loadAlreadyCalled = true;
        loadInProgress = false;
      });
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
    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      this.getGoogletag().then((googletag) => {
        googletag.cmd.push(() => {
          const pubadsService = googletag.pubads();
          pubadsService.setRequestNonPersonalizedAds(
            this.personalizedAdsEnabled() ? 0 : 1,
          );
          pubadsService.refresh(
            Object.keys(
              this.getRefreshableSlots(...slots),
            ).map(slotId => registeredSlots[slotId].gptSlot),
          );
        });
      });
    }
  },

  destroyGPTSlots(...slotsToDestroy) {
    const slots = slotsToDestroy.map(slotId => registeredSlots[slotId].gptSlot);
    return this.getGoogletag()
      .then((googletag) => {
        googletag.cmd.push(() => {
          if (managerAlreadyInitialized === true) {
            if (slotsToDestroy.length > 0) {
              googletag.destroySlots(slots);
            } else {
              googletag.destroySlots();
            }
          }
        });
      });
  },

  registerSlot({
    dfpNetworkId,
    adUnit,
    sizes,
    renderOutOfThePage,
    sizeMapping,
    adSenseAttributes,
    targetingArguments,
    slotId,
    slotShouldRefresh,
  }) {
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
      if (loadAlreadyCalled === true) {
        this.load(slotId);
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

  attachSlotIsViewable(cb) {
    this.on('impressionViewable', cb);
  },

  detachSlotIsViewable(cb) {
    this.removeListener('impressionViewable', cb);
  },

});

export default DFPManager;
