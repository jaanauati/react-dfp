'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DFPManager = undefined;

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
  init: function init() {
    var _this = this;

    if (managerAlreadyInitialized === false) {
      managerAlreadyInitialized = true;
      this.getGoogletag().then(function () {
        googletag.cmd.push(function () {
          pubadsService = googletag.pubads();
          pubadsService.addEventListener('slotRenderEnded', function (event) {
            var slotId = event.slot.getSlotElementId();
            _this.emit('slotRenderEnded', { slotId: slotId, event: event });
          });

          Object.keys(globalTargetingArguments).forEach(function (varName) {
            if (globalTargetingArguments.hasOwnProperty(varName)) {
              pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
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
        if (slot.targetingArguments) {
          Object.keys(slot.targetingArguments).forEach(function (varName) {
            if (slot.targetingArguments.hasOwnProperty(varName)) {
              slot.gptSlot.setTargeting(varName, slot.targetingArguments[varName]);
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
    loadAlreadyCalled = true;
  },
  refresh: function refresh() {
    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      googletag.cmd.push(function () {
        var slotsToRefresh = Object.keys(registeredSlots).map(function (k) {
          return registeredSlots[k];
        });
        slotsToRefresh.filter(function (slotData) {
          return slotData.slotShouldRefresh();
        });
        slotsToRefresh = slotsToRefresh.map(function (slotData) {
          return slotData.gptSlot;
        });
        googletag.pubads().refresh(slotsToRefresh);
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
  attachSlotRenderEnded: function attachSlotRenderEnded(cb) {
    this.on('slotRenderEnded', cb);
  },
  detachSlotRenderEnded: function detachSlotRenderEnded(cb) {
    this.off('slotRenderEnded', cb);
  }
});
