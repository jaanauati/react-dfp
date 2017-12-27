import { EventEmitter } from 'events';
import * as Utils from './utils';

class DfpManager {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(0);
    
    this.registeredSlots = {};
    this.targetingArguments = {};
    this.collapseEmptyDivs = false;
    this.isLoadAlreadyCalled = false;
    this.isManagerInitialized = false;
    this.googleTagPromise = Utils.loadGPTScript();
  }

  setTargetingArguments = async values => {
    this.targetingArguments = {
      ...this.targetingArguments,
      ...values,
    };

    if (this.isManagerInitialized) {
      const googleTag = await this.getGoogletag();

      googleTag.cmd.push(() => {
        const pubAds = googleTag.pubAds();

        Object.keys(this.targetingArguments)
          .forEach(key => pubAds.setTargeting(key, this.targetingArguments[key]));
      });
    }
  }

  getSlotTargetingArguments = slotId => {
    const slot = this.getRegisteredSlots()[slotId];

    if (slot !== undefined && slot.targetingArguments !== undefined && 
      slot.targetingArguments !== null && Object.keys(slot.targetingArguments).length > 0
    ) {
      return slot.targetingArguments;
    }

    return null;
  };

  init = async () => {
    if (this.isManagerInitialized === false) {
      this.isManagerInitialized = true;

      const googleTag = await this.getGoogletag();

      googleTag.cmd.push(() => {
        const pubAds = googleTag.pubads();
        
        pubAds.addEventListener('slotRenderEnded', ev => this.eventEmitter.emit('slotRenderEnded', { slotId: ev.slot.getSlotElementId(), event: ev }));
        
        Object.keys(this.targetingArguments)
          .forEach(key => pubAds.setTargeting(key, this.targetingArguments[key]));
      });
    }
  };

  getAvailableSlots = slotId => {
    let availableSlots = {};

    if (this.isLoadAlreadyCalled) {
      const slot = this.registeredSlots[slotId];
      
      if (slot !== undefined) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = this.registeredSlots;
    }

    return Object.keys(availableSlots)
      .filter(id => !availableSlots[id].loading)
      .reduce(
      (result, id) => 
      Object.assign(
        result, {
          [id]: Object.assign(availableSlots[id], { loading: true }),
        },
      ), {},
    );
  }

  load = async slotId => {
    await this.init();

    const availableSlots = this.getAvailableSlots(slotId);
    const googleTag = await this.getGoogletag();

    Object.keys(availableSlots).forEach((currentSlotId) => {
      availableSlots[currentSlotId].loading = false;

      googleTag.cmd.push(() => {
        const slot = availableSlots[currentSlotId];
        const adUnit = `${slot.dfpNetworkId}/${slot.adUnit}`;
        let gptSlot;
            
        if (slot.renderOutOfThePage) {
          gptSlot = googleTag.defineOutOfPageSlot(adUnit, currentSlotId);
        } else {
          gptSlot = googleTag.defineSlot(adUnit, slot.sizes, currentSlotId);
        }

        slot.gptSlot = gptSlot;
            
        if (slot.gptSlot) { 
          Object.keys(this.slotTargetingArguments)
            .forEach(key => slot.gptSlot.setTargeting(key, this.slotTargetingArguments[key]));

          slot.gptSlot.addService(googleTag.pubads());
        }

        if (slot.sizeMapping) {
          let smbuilder = googleTag.sizeMapping();

          slot.sizeMapping.forEach(({ viewport, sizes }) => {
            smbuilder = smbuilder.addSize(viewport, sizes);
          });

          slot.gptSlot.defineSizeMapping(smbuilder.build());
        }
      });
    });

    googleTag.cmd.push(() => {
      googleTag.pubads().enableSingleRequest();

      if (this.collapseEmptyDivs !== undefined || this.collapseEmptyDivs !== null) {
        googleTag.pubads().collapseEmptyDivs(this.collapseEmptyDivs);
      }

      googleTag.enableServices();

      Object.keys(availableSlots).forEach(id => googleTag.display(id));
    });
    
    this.isLoadAlreadyCalled = true;
  }
 
  getGoogletag = () => {
    if (this.googleTagPromise === null) {
      this.googleTagPromise = Utils.loadGPTScript();
    }
   
    return this.googleTagPromise;
  }

  setCollapseEmptyDivs = shouldCollapse => {
    this.collapseEmptyDivs = shouldCollapse;
  }

  getTargetingArguments = () => this.targetingArguments;

  attachSlotRenderEnded = cb => this.eventEmitter.on('slotRenderEnded', cb);

  detachSlotRenderEnded = cb => this.eventEmitter.removeListener('slotRenderEnded', cb);

  getRegisteredSlots = () => this.registeredSlots;

  unregisterSlot = ({ slotId }) => delete this.registeredSlots[slotId];

  getRefreshableSlots = () => {
    const slotsToRefresh = Object.keys(this.registeredSlots).map(key => this.registeredSlots[key]);
    const slotsReducer = (acc, it) => {
      if (it.slotShouldRefresh()) {
        acc[it.slotId] = it;
      }

      return acc;
    };
    
    return slotsToRefresh.reduce(slotsReducer, {});
  };

  refresh = async () => {
    if (this.isLoadAlreadyCalled === false) {
      await this.load();
    } else {
      const googleTag = await this.getGoogletag(); 
      const slotsToRefresh = this.getRefreshableSlots();
      const pubAds = googleTag.pubAds();
        
      googleTag.cmd.push(() => 
        pubAds().refresh(Object.keys(slotsToRefresh).map(key => slotsToRefresh[key].gptSlot)),
      );
    }
  };

  registerSlot = async values => {
    const {
      dfpNetworkId,
      adUnit,
      sizes,
      renderOutOfThePage,
      sizeMapping,
      targetingArguments,
      slotId,
      slotShouldRefresh,
    } = values;

    if (!this.registeredSlots.hasOwnProperty(slotId)) {
      this.registeredSlots[slotId] = {
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

    if (this.isLoadAlreadyCalled === true) {
      await this.load(slotId);
    }
  };
}

export default new DfpManager();
