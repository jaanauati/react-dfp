import { EventEmitter } from 'events';
import * as Utils from './utils';

class DfpManager {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(0);
    
    this.registeredSlots = {};
    this.adSenseAttributes = {};
    this.targetingArguments = {};
    this.collapseEmptyDivs = false;
    this.isLoadAlreadyCalled = false;
    this.isManagerInitialized = false;
    this.googleTagPromise = Utils.loadGPTScript();
  }

  getAdSenseAttribute = key => this.adSenseAttributes[key];

  setAdSenseAttribute = (key, value) => {
    this.setAdSenseAttributes({ [key]: value });
  };

  getAdSenseAttributes = () => this.adSenseAttributes;

  setAdSenseAttributes = values => {
    this.adSenseAttributes = {
      ...this.adSenseAttributes,
      ...values,
    };

    if (this.isManagerInitialized) {
      this.getGoogletag().then(googleTag => {
        googleTag.cmd.push(() => 
          Object.keys(this.adSenseAttributes).forEach(
            key => googletag.pubads().set(key, this.targetingArguments[key]),
          ),
        );
      });
    }
  };

  setTargetingArguments = values => {
    this.targetingArguments = {
      ...this.targetingArguments,
      ...values,
    };

    if (this.isManagerInitialized) {
      this.getGoogletag().then(googleTag => {
        googleTag.cmd.push(() => {
          const pubAds = googleTag.pubAds();

          Object.keys(this.targetingArguments)
            .forEach(key => pubAds.setTargeting(key, this.targetingArguments[key]));
        });
      });
    }
  }

  getSlotProperty = (slotId, propName) => {
    const slot = this.getRegisteredSlots()[slotId];
    
    if (slot !== undefined) {
      return slot[propName] || null;
    }

    return null;
  };

  getSlotTargetingArguments = slotId => {
    const propValue = this.getSlotProperty(slotId, 'targetingArguments');
    return propValue ? { ...propValue } : null;
  };

  getSlotAdSenseAttributes = slotId => {
    const propValue = this.getSlotProperty(slotId, 'adSenseAttributes');
    return propValue ? { ...propValue } : null;
  };

  init = () => {
    if (this.isManagerInitialized === false) {
      this.isManagerInitialized = true;

      this.getGoogletag().then(googleTag => {
        googleTag.cmd.push(() => {
          const pubAds = googleTag.pubads();
          
          pubAds.addEventListener('slotRenderEnded', ev => this.eventEmitter.emit('slotRenderEnded', { slotId: ev.slot.getSlotElementId(), event: ev }));
          
          Object.keys(this.targetingArguments)
            .forEach(key => pubAds.setTargeting(key, this.targetingArguments[key]));
          
          Object.keys(this.adSenseAttributes)
            .forEach(key => pubAds.set(key, this.adSenseAttributes[key]));
        });
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

  load = slotId => {
    this.init();

    const availableSlots = this.getAvailableSlots(slotId);
  
    this.getGoogletag().then(googleTag => {
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
            
            const slotAdSenseAttributes = this.getSlotAdSenseAttributes(currentSlotId);
          
            if (slotAdSenseAttributes !== null) {
              Object.keys(slotAdSenseAttributes)
                .forEach(key => slot.gptSlot.set(key, slotAdSenseAttributes[key]));
            }
    
            if (slot.sizeMapping) {
              let smbuilder = googleTag.sizeMapping();
    
              slot.sizeMapping.forEach(({ viewport, sizes }) => {
                smbuilder = smbuilder.addSize(viewport, sizes);
              });
    
              slot.gptSlot.defineSizeMapping(smbuilder.build());
            }
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

  refresh = () => {
    if (this.isLoadAlreadyCalled === false) {
      this.load();
    } else {
      this.getGoogletag().then(googleTag => {
        const slotsToRefresh = this.getRefreshableSlots();
        const pubAds = googleTag.pubAds();
          
        googleTag.cmd.push(() => 
          pubAds().refresh(Object.keys(slotsToRefresh).map(key => slotsToRefresh[key].gptSlot)),
        );
      });
    }
  };

  registerSlot = values => {
    const {
      dfpNetworkId,
      adUnit,
      adSenseAttributes,
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
        adSenseAttributes,
        targetingArguments,
        sizeMapping,
        slotShouldRefresh,
        loading: false,
      };
    }

    if (this.isLoadAlreadyCalled === true) {
      this.load(slotId);
    }
  };
}

export default new DfpManager();
