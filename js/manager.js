import * as Utils from './utils';
import { EventEmitter } from 'events';

let loadAlreadyCalled = false;
let googleGPTScriptLoadPromise = null;
const registeredSlots = {};
let pubadsService = null;
let managerAlreadyInitialized = false;
const globalTargetingArguments = {};

export const DFPManager = Object.assign(new EventEmitter(), {
  setTargetingArguments(data) {
    Object.assign(globalTargetingArguments, data);
  },

  init() {
    if (managerAlreadyInitialized === false) {
      managerAlreadyInitialized = true;
      this.getGoogletag().then(() => {
        googletag.cmd.push(() => {
          pubadsService = googletag.pubads();
          pubadsService.addEventListener('slotRenderEnded', (event) => {
            const slotId = event.slot.getSlotElementId();
            this.emit('slotRenderEnded', { slotId, event });
          });

          Object.keys(globalTargetingArguments).forEach((varName) => {
            if (globalTargetingArguments.hasOwnProperty(varName)) {
              pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
            }
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

  load(slotId) {
    this.init();
    let availableSlots = {};
    if (loadAlreadyCalled === true) {
      const slot = registeredSlots[slotId];
      if (slot !== undefined && slot.loaded !== true) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = registeredSlots;
    }

    Object.keys(availableSlots).forEach((currentSlotId) => {
      availableSlots[currentSlotId].loaded = true;
      googletag.cmd.push(() => {
        const slot = availableSlots[currentSlotId];
        let gptSlot;
        const adUnit = `${slot.dfpNetworkId}/${slot.adUnit}`;
        if (slot.renderOutOfThePage === true) {
          gptSlot = googletag.defineOutOfPageSlot(adUnit, currentSlotId);
        } else {
          gptSlot = googletag.defineSlot(adUnit, slot.sizes, currentSlotId);
        }
        slot.gptSlot = gptSlot;
        if (slot.targetingArguments) {
          Object.keys(slot.targetingArguments).forEach((varName) => {
            if (slot.targetingArguments.hasOwnProperty(varName)) {
              slot.gptSlot.setTargeting(varName, slot.targetingArguments[varName]);
            }
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
      });
    });

    googletag.cmd.push(() => {
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
      Object.keys(availableSlots).forEach((_slotId) => {
        if (availableSlots.hasOwnProperty(_slotId)) {
          googletag.display(_slotId);
        }
      });
    });
    loadAlreadyCalled = true;
  },

  refresh() {
    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      googletag.cmd.push(() => {
        let slotsToRefresh = Object.keys(registeredSlots).map((k) => registeredSlots[k]);
        slotsToRefresh.filter((slotData) => slotData.slotShouldRefresh());
        slotsToRefresh = slotsToRefresh.map((slotData) => slotData.gptSlot);
        googletag.pubads().refresh(slotsToRefresh);
      });
    }
  },

  registerSlot({ dfpNetworkId, adUnit, sizes, renderOutOfThePage, sizeMapping,
                 targetingArguments, slotId, slotShouldRefresh }) {
    if (!registeredSlots.hasOwnProperty(slotId)) {
      registeredSlots[slotId] = { slotId, sizes, renderOutOfThePage,
                                  dfpNetworkId, adUnit, targetingArguments,
                                  sizeMapping, slotShouldRefresh, loaded: false,
                                };
    }
    if (loadAlreadyCalled === true) {
      this.load(slotId);
    }
  },

  unregisterSlot({ slotId }) {
    delete registeredSlots[slotId];
  },

  attachSlotRenderEnded(cb) {
    this.on('slotRenderEnded', cb);
  },

  detachSlotRenderEnded(cb) {
    this.off('slotRenderEnded', cb);
  },

});
