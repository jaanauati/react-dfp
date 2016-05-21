'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DFPManager = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _events = require('events');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var loadAlreadyCalled = false;
var googleGPTScriptLoadPromise = null;
var registeredSlots = {};
var pubadsService = null;
var managerAlreadyInitialized = false;
var globalTargetingArguments = {};

var DFPManager = exports.DFPManager = Object.assign(new _events.EventEmitter(), {
  setTargetingArguments: function setTargetingArguments(data) {
    Object.assign(globalTargetingArguments, data);
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
          pubadsService = googletag.pubads();
          pubadsService.addEventListener('slotRenderEnded', function (event) {
            var slotId = event.slot.getSlotElementId();
            _this.emit('slotRenderEnded', { slotId: slotId, event: event });
          });
          var targetingArguments = _this.getTargetingArguments();
          Object.keys(targetingArguments).forEach(function (varName) {
            if (targetingArguments.hasOwnProperty(varName)) {
              pubadsService.setTargeting(varName, targetingArguments[varName]);
            }
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
  load: function load(slotId) {
    var _this2 = this;

    this.init();
    var availableSlots = {};
    if (loadAlreadyCalled === true) {
      var slot = registeredSlots[slotId];
      if (slot !== undefined && slot.loaded !== true) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = registeredSlots;
    }
    this.getGoogletag().then(function (googletag) {
      Object.keys(availableSlots).forEach(function (currentSlotId) {
        availableSlots[currentSlotId].loaded = true;
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
              if (slotTargetingArguments.hasOwnProperty(varName)) {
                slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
              }
            });
          }
          slot.gptSlot.addService(googletag.pubads());
          if (slot.sizeMapping) {
            (function () {
              var smbuilder = googletag.sizeMapping();
              slot.sizeMapping.forEach(function (mapping) {
                smbuilder = smbuilder.addSize(mapping.viewport, mapping.sizes);
              });
              slot.gptSlot.defineSizeMapping(smbuilder.build());
            })();
          }
        });
      });

      googletag.cmd.push(function () {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
        Object.keys(availableSlots).forEach(function (_slotId) {
          if (availableSlots.hasOwnProperty(_slotId)) {
            googletag.display(_slotId);
          }
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
    var dfpNetworkId = _ref.dfpNetworkId;
    var adUnit = _ref.adUnit;
    var sizes = _ref.sizes;
    var renderOutOfThePage = _ref.renderOutOfThePage;
    var sizeMapping = _ref.sizeMapping;
    var targetingArguments = _ref.targetingArguments;
    var slotId = _ref.slotId;
    var slotShouldRefresh = _ref.slotShouldRefresh;

    if (!registeredSlots.hasOwnProperty(slotId)) {
      registeredSlots[slotId] = { slotId: slotId, sizes: sizes, renderOutOfThePage: renderOutOfThePage,
        dfpNetworkId: dfpNetworkId, adUnit: adUnit, targetingArguments: targetingArguments,
        sizeMapping: sizeMapping, slotShouldRefresh: slotShouldRefresh, loaded: false
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
