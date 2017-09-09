'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _events = require('events');

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var loadAlreadyCalled = false;
var googleGPTScriptLoadPromise = null;
var registeredSlots = {};
var managerAlreadyInitialized = false;
var globalTargetingArguments = {};

var DFPManager = _extends(new _events.EventEmitter().setMaxListeners(0), {
  setTargetingArguments: function setTargetingArguments(data) {
    _extends(globalTargetingArguments, data);
    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then(function (googletag) {
        googletag.cmd.push(function () {
          var pubadsService = googletag.pubads();
          Object.keys(globalTargetingArguments).forEach(function (varName) {
            pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
          });
        });
      });
    }
  },
  getTargetingArguments: function getTargetingArguments() {
    return _extends({}, globalTargetingArguments);
  },
  getSlotTargetingArguments: function getSlotTargetingArguments(slotId) {
    var slot = this.getRegisteredSlots()[slotId];
    var ret = null;
    if (slot !== undefined && slot.targetingArguments !== undefined) {
      ret = _extends({}, slot.targetingArguments);
    }
    return ret;
  },
  init: function init() {
    var _this = this;

    if (managerAlreadyInitialized === false) {
      managerAlreadyInitialized = true;
      this.getGoogletag().then(function (googletag) {
        googletag.cmd.push(function () {
          var pubadsService = googletag.pubads();
          pubadsService.addEventListener('slotRenderEnded', function (event) {
            var slotId = event.slot.getSlotElementId();
            _this.emit('slotRenderEnded', { slotId: slotId, event: event });
          });
          var targetingArguments = _this.getTargetingArguments();
          Object.keys(targetingArguments).forEach(function (varName) {
            pubadsService.setTargeting(varName, targetingArguments[varName]);
          });
        });
      });
    }
  },
  getGoogletag: function getGoogletag() {
    if (googleGPTScriptLoadPromise === null) {
      googleGPTScriptLoadPromise = Utils.loadGPTScript();
    }
    return googleGPTScriptLoadPromise;
  },
  setCollapseEmptyDivs: function setCollapseEmptyDivs(collapse) {
    this.collapseEmptyDivs = collapse;
  },
  load: function load(slotId) {
    var _this2 = this;

    this.init();
    var availableSlots = {};

    if (loadAlreadyCalled === true) {
      var slot = registeredSlots[slotId];
      if (slot !== undefined) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = registeredSlots;
    }

    availableSlots = Object.keys(availableSlots).filter(function (id) {
      return !availableSlots[id].loading;
    }).reduce(function (result, id) {
      return _extends(result, _defineProperty({}, id, _extends(availableSlots[id], { loading: true })));
    }, {});
    this.getGoogletag().then(function (googletag) {
      Object.keys(availableSlots).forEach(function (currentSlotId) {
        availableSlots[currentSlotId].loading = false;

        googletag.cmd.push(function () {
          var slot = availableSlots[currentSlotId];
          var gptSlot = void 0;
          var adUnit = slot.dfpNetworkId + '/' + slot.adUnit;
          if (slot.renderOutOfThePage === true) {
            gptSlot = googletag.defineOutOfPageSlot(adUnit, currentSlotId);
          } else {
            gptSlot = googletag.defineSlot(adUnit, slot.sizes, currentSlotId);
          }
          slot.gptSlot = gptSlot;
          var slotTargetingArguments = _this2.getSlotTargetingArguments(currentSlotId);
          if (slotTargetingArguments !== null) {
            Object.keys(slotTargetingArguments).forEach(function (varName) {
              slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
            });
          }
          slot.gptSlot.addService(googletag.pubads());
          if (slot.sizeMapping) {
            var smbuilder = googletag.sizeMapping();
            slot.sizeMapping.forEach(function (mapping) {
              smbuilder = smbuilder.addSize(mapping.viewport, mapping.sizes);
            });
            slot.gptSlot.defineSizeMapping(smbuilder.build());
          }
        });
      });

      googletag.cmd.push(function () {
        googletag.pubads().enableSingleRequest();

        if (_this2.collapseEmptyDivs === true || _this2.collapseEmptyDivs === false) {
          googletag.pubads().collapseEmptyDivs(_this2.collapseEmptyDivs);
        }

        googletag.enableServices();
        Object.keys(availableSlots).forEach(function (theSlotId) {
          googletag.display(theSlotId);
        });
      });
    });
    loadAlreadyCalled = true;
  },
  getRefreshableSlots: function getRefreshableSlots() {
    var slotsToRefresh = Object.keys(registeredSlots).map(function (k) {
      return registeredSlots[k];
    });
    var slots = {};
    return slotsToRefresh.reduce(function (last, slot) {
      if (slot.slotShouldRefresh() === true) {
        slots[slot.slotId] = slot;
      }
      return slots;
    }, slots);
  },
  refresh: function refresh() {
    var _this3 = this;

    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      this.getGoogletag().then(function (googletag) {
        var slotsToRefresh = _this3.getRefreshableSlots();
        googletag.cmd.push(function () {
          googletag.pubads().refresh(Object.keys(slotsToRefresh).map(function (slotId) {
            return slotsToRefresh[slotId].gptSlot;
          }));
        });
      });
    }
  },
  registerSlot: function registerSlot(_ref) {
    var dfpNetworkId = _ref.dfpNetworkId,
        adUnit = _ref.adUnit,
        sizes = _ref.sizes,
        renderOutOfThePage = _ref.renderOutOfThePage,
        sizeMapping = _ref.sizeMapping,
        targetingArguments = _ref.targetingArguments,
        slotId = _ref.slotId,
        slotShouldRefresh = _ref.slotShouldRefresh;

    if (!Object.prototype.hasOwnProperty.call(registeredSlots, slotId)) {
      registeredSlots[slotId] = {
        slotId: slotId,
        sizes: sizes,
        renderOutOfThePage: renderOutOfThePage,
        dfpNetworkId: dfpNetworkId,
        adUnit: adUnit,
        targetingArguments: targetingArguments,
        sizeMapping: sizeMapping,
        slotShouldRefresh: slotShouldRefresh,
        loading: false
      };
    }
    if (loadAlreadyCalled === true) {
      this.load(slotId);
    }
  },
  unregisterSlot: function unregisterSlot(_ref2) {
    var slotId = _ref2.slotId;

    delete registeredSlots[slotId];
  },
  getRegisteredSlots: function getRegisteredSlots() {
    return registeredSlots;
  },
  attachSlotRenderEnded: function attachSlotRenderEnded(cb) {
    this.on('slotRenderEnded', cb);
  },
  detachSlotRenderEnded: function detachSlotRenderEnded(cb) {
    this.removeListener('slotRenderEnded', cb);
  }
});

exports.default = DFPManager;
