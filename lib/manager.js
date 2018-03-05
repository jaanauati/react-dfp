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
var loadInProgress = false;
var loadPromise = null;
var googleGPTScriptLoadPromise = null;
var registeredSlots = {};
var managerAlreadyInitialized = false;
var globalTargetingArguments = {};
var globalAdSenseAttributes = {};

var DFPManager = _extends(new _events.EventEmitter().setMaxListeners(0), {
  getAdSenseAttribute: function getAdSenseAttribute(key) {
    return globalAdSenseAttributes[key];
  },
  setAdSenseAttribute: function setAdSenseAttribute(key, value) {
    this.setAdSenseAttributes(_defineProperty({}, key, value));
  },
  getAdSenseAttributes: function getAdSenseAttributes() {
    return _extends({}, globalAdSenseAttributes);
  },
  setAdSenseAttributes: function setAdSenseAttributes(attrs) {
    _extends(globalAdSenseAttributes, attrs);
    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then(function (googletag) {
        googletag.cmd.push(function () {
          var pubadsService = googletag.pubads();
          Object.keys(globalAdSenseAttributes).forEach(function (key) {
            pubadsService.set(key, globalTargetingArguments[key]);
          });
        });
      });
    }
  },
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
  getSlotProperty: function getSlotProperty(slotId, propName) {
    var slot = this.getRegisteredSlots()[slotId];
    var ret = null;
    if (slot !== undefined) {
      ret = slot[propName] || ret;
    }
    return ret;
  },
  getSlotTargetingArguments: function getSlotTargetingArguments(slotId) {
    var propValue = this.getSlotProperty(slotId, 'targetingArguments');
    return propValue ? _extends({}, propValue) : null;
  },
  getSlotAdSenseAttributes: function getSlotAdSenseAttributes(slotId) {
    var propValue = this.getSlotProperty(slotId, 'adSenseAttributes');
    return propValue ? _extends({}, propValue) : null;
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
          // set global targetting arguments
          Object.keys(targetingArguments).forEach(function (varName) {
            pubadsService.setTargeting(varName, targetingArguments[varName]);
          });
          // set global adSense attributes
          var adSenseAttributes = _this.getAdSenseAttributes();
          Object.keys(adSenseAttributes).forEach(function (key) {
            pubadsService.set(key, adSenseAttributes[key]);
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

    if (loadInProgress === true || loadPromise !== null) {
      loadPromise = loadPromise.then(function () {
        return _this2.doLoad(slotId);
      });
    } else {
      loadPromise = this.doLoad(slotId);
    }
  },
  doLoad: function doLoad(slotId) {
    var _this3 = this;

    loadInProgress = true;
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
      return !availableSlots[id].loading && !availableSlots[id].gptSlot;
    }).reduce(function (result, id) {
      return _extends(result, _defineProperty({}, id, _extends(availableSlots[id], { loading: true })));
    }, {});

    return this.getGoogletag().then(function (googletag) {
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
          if (gptSlot !== null) {
            slot.gptSlot = gptSlot;
            var slotTargetingArguments = _this3.getSlotTargetingArguments(currentSlotId);
            if (slotTargetingArguments !== null) {
              Object.keys(slotTargetingArguments).forEach(function (varName) {
                slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
              });
            }
            var slotAdSenseAttributes = _this3.getSlotAdSenseAttributes(currentSlotId);
            if (slotAdSenseAttributes !== null) {
              Object.keys(slotAdSenseAttributes).forEach(function (varName) {
                slot.gptSlot.set(varName, slotAdSenseAttributes[varName]);
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
          }
        });
      });

      googletag.cmd.push(function () {
        googletag.pubads().enableSingleRequest();

        if (_this3.collapseEmptyDivs === true || _this3.collapseEmptyDivs === false) {
          googletag.pubads().collapseEmptyDivs(_this3.collapseEmptyDivs);
        }

        googletag.enableServices();
        Object.keys(availableSlots).forEach(function (theSlotId) {
          googletag.display(theSlotId);
        });
        loadAlreadyCalled = true;
        loadInProgress = false;
      });
    });
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
    var _this4 = this;

    if (loadAlreadyCalled === false) {
      this.load();
    } else {
      this.getGoogletag().then(function (googletag) {
        var slotsToRefresh = _this4.getRefreshableSlots();
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
        adSenseAttributes = _ref.adSenseAttributes,
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
        adSenseAttributes: adSenseAttributes,
        targetingArguments: targetingArguments,
        sizeMapping: sizeMapping,
        slotShouldRefresh: slotShouldRefresh,
        loading: false
      };
      this.emit('slotRegistered', { slotId: slotId });
      if (loadAlreadyCalled === true) {
        this.load(slotId);
      }
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
