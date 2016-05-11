import * as Utils from './utils';
import { EventEmitter }  from 'events';

let googleDFP = null;
const registeredSlots = {};
let pubadsService = null;
let loaded = false;
const targetingArguments = {};

export const DFPManager = Object.assign(new EventEmitter(), {
  setTargetingArguments(data) {
    Object.assign(targetingArguments, data);
  },

  init() {
    if (googleDFP === null) {
      googleDFP = Utils.loadGPTScript();
    }
    return googleDFP;
  },

  load() {
    if (loaded === false) {
      loaded = true;
      this.init();
      googletag.cmd.push(() => {
        pubadsService = googletag.pubads();
        pubadsService.addEventListener('slotRenderEnded', (event) => {
          const slotId = event.slot.getSlotElementId();
          this.emit('slotRenderEnded', {slotId, event});
        });

        for (let k of Object.keys(targetingArguments)) {
          pubadsService.setTargeting(k, targetingArguments[k]);
        }
      });

      Object.keys(registeredSlots).forEach(function defineSlots(slotId) {
        googletag.cmd.push(function defineSlot() {
          const slot = registeredSlots[slotId];
          slot.gptSlot = googletag.defineSlot(`${slot.dfpNetworkId}/${slot.adUnit}`,
                                              slot.sizes, slot.slotId);
          if (slot.targetingArguments) {
            for (let k of Object.keys(slot.targetingArguments)) {
              slot.gptSlot.setTargeting(k, slot.targetingArguments[k]);
            }
          }
          slot.gptSlot.addService(googletag.pubads());
        });
      });

      googletag.cmd.push(function displaySlots() {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
        for (let slotId of Object.keys(registeredSlots)) {
          googletag.display(slotId);
        }
      });
    }
  },

  refresh() {
    if (loaded === false) {
      this.load();
    } else {
      googletag.cmd.push(function refreshSlots() {
        let slotsToRefresh = Object.keys(registeredSlots).map((k) => registeredSlots[k]);
        slotsToRefresh.filter((slotData) => slotData.slotShouldRefresh());
        slotsToRefresh = slotsToRefresh.map((slotData) => slotData.gptSlot);
        googletag.pubads().refresh(slotsToRefresh);
      });
    }
  },

  registerSlot({dfpNetworkId, adUnit, sizes, targetingArguments, slotId, slotShouldRefresh}) {
    if (!registeredSlots.hasOwnProperty(slotId)) {
      registeredSlots[slotId] = {slotId, sizes, dfpNetworkId, adUnit, targetingArguments, slotShouldRefresh};
    }
  },

  unregisterSlot({dfpNetworkId, adUnit, sizes, slotId, slotShouldRefresh}) {
    delete registeredSlots[slotId];
  },

  attachSlotRenderEnded(cb) {
    this.on('slotRenderEnded', cb);
  },

  detachSlotRenderEnded(cb) {
    this.off('slotRenderEnded', cb);
  },

});
