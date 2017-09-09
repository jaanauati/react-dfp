import { EventEmitter } from 'events';
import * as Utils from './utils';

let loadAlreadyCalled = false;
let googleGPTScriptLoadPromise = null;
const registeredSlots = {};
let managerAlreadyInitialized = false;
const globalTargetingArguments = {};

const DFPManager = Object.assign(new EventEmitter().setMaxListeners(0), {
  setTargetingArguments(data) {
    Object.assign(globalTargetingArguments, data);
    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then((googletag) => {
        googletag.cmd.push(() => {
          const pubadsService = googletag.pubads();
          Object.keys(globalTargetingArguments).forEach((varName) => {
            pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
          });
        });
      });
    }
  },

  getTargetingArguments() {
    return { ...globalTargetingArguments };
  },

  getSlotTargetingArguments(slotId) {
    const slot = this.getRegisteredSlots()[slotId];
    let ret = null;
    if (slot !== undefined && slot.targetingArguments !== undefined) {
      ret = { ...slot.targetingArguments };
    }
    return ret;
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
          const targetingArguments = this.getTargetingArguments();
          Object.keys(targetingArguments).forEach((varName) => {
            pubadsService.setTargeting(varName, targetingArguments[varName]);
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
      .filter(id => !availableSlots[id].loading)
      .reduce(
      (result, id) => Object.assign(
        result, {
          [id]: Object.assign(availableSlots[id], { loading: true }),
        },
      ), {},
    );
    this.getGoogletag().then((googletag) => {
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
          slot.gptSlot = gptSlot;
          const slotTargetingArguments = this.getSlotTargetingArguments(currentSlotId);
          if (slotTargetingArguments !== null) {
            Object.keys(slotTargetingArguments).forEach((varName) => {
              slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
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

        if (this.collapseEmptyDivs === true || this.collapseEmptyDivs === false) {
          googletag.pubads().collapseEmptyDivs(this.collapseEmptyDivs);
        }

        googletag.enableServices();
        Object.keys(availableSlots).forEach((theSlotId) => {
          googletag.display(theSlotId);
        });
      });
    });
    loadAlreadyCalled = true;
  },

  getRefreshableSlots() {
    const slotsToRefresh = Object.keys(registeredSlots).map(k => registeredSlots[k]);
    const slots = {};
    return slotsToRefresh.reduce((last, slot) => {
      if (slot.slotShouldRefresh() === true) {
        slots[slot.slotId] = slot;
      }
      return slots;
    }, slots);
  },

  refresh() {
    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      this.getGoogletag().then((googletag) => {
        const slotsToRefresh = this.getRefreshableSlots();
        googletag.cmd.push(() => {
          googletag.pubads().refresh(
            Object.keys(slotsToRefresh).map(slotId => slotsToRefresh[slotId].gptSlot),
          );
        });
      });
    }
  },

  registerSlot({
        dfpNetworkId,
        adUnit,
        sizes,
        renderOutOfThePage,
        sizeMapping,
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
        targetingArguments,
        sizeMapping,
        slotShouldRefresh,
        loading: false,
      };
    }
    if (loadAlreadyCalled === true) {
      this.load(slotId);
    }
  },

  unregisterSlot({ slotId }) {
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

});

export default DFPManager;
