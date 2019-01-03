"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var Utils = _interopRequireWildcard(require("./utils"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var loadAlreadyCalled = false;
var loadInProgress = false;
var loadPromise = null;
var googleGPTScriptLoadPromise = null;
var singleRequestEnabled = true;
var servePersonalizedAds = true;
var registeredSlots = {};
var managerAlreadyInitialized = false;
var globalTargetingArguments = {};
var globalAdSenseAttributes = {};
var DFPManager = Object.assign(new _events.EventEmitter().setMaxListeners(0), {
  singleRequestIsEnabled: function singleRequestIsEnabled() {
    return singleRequestEnabled;
  },
  configureSingleRequest: function configureSingleRequest(value) {
    singleRequestEnabled = !!value;
  },
  getAdSenseAttribute: function getAdSenseAttribute(key) {
    return globalAdSenseAttributes[key];
  },
  configurePersonalizedAds: function configurePersonalizedAds(value) {
    servePersonalizedAds = value;
  },
  personalizedAdsEnabled: function personalizedAdsEnabled() {
    return servePersonalizedAds;
  },
  setAdSenseAttribute: function setAdSenseAttribute(key, value) {
    this.setAdSenseAttributes(_defineProperty({}, key, value));
  },
  getAdSenseAttributes: function getAdSenseAttributes() {
    return _objectSpread({}, globalAdSenseAttributes);
  },
  setAdSenseAttributes: function setAdSenseAttributes(attrs) {
    Object.assign(globalAdSenseAttributes, attrs);

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
    Object.assign(globalTargetingArguments, data);

    if (managerAlreadyInitialized === true) {
      this.getGoogletag().then(function (googletag) {
        googletag.cmd.push(function () {
          var pubadsService = googletag.pubads();
          Object.keys(globalTargetingArguments).forEach(function (varName) {
            if (pubadsService) {
              pubadsService.setTargeting(varName, globalTargetingArguments[varName]);
            }
          });
        });
      });
    }
  },
  getTargetingArguments: function getTargetingArguments() {
    return _objectSpread({}, globalTargetingArguments);
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
    return propValue ? _objectSpread({}, propValue) : null;
  },
  getSlotAdSenseAttributes: function getSlotAdSenseAttributes(slotId) {
    var propValue = this.getSlotProperty(slotId, 'adSenseAttributes');
    return propValue ? _objectSpread({}, propValue) : null;
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

            _this.emit('slotRenderEnded', {
              slotId: slotId,
              event: event
            });
          });
          pubadsService.addEventListener('impressionViewable', function (event) {
            var slotId = event.slot.getSlotElementId();

            _this.emit('impressionViewable', {
              slotId: slotId,
              event: event
            });
          });
          pubadsService.setRequestNonPersonalizedAds(_this.servePersonalizedAds() ? 0 : 1);

          var targetingArguments = _this.getTargetingArguments(); // set global targetting arguments


          Object.keys(targetingArguments).forEach(function (varName) {
            if (pubadsService) {
              pubadsService.setTargeting(varName, targetingArguments[varName]);
            }
          }); // set global adSense attributes

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
      return Object.assign(result, _defineProperty({}, id, Object.assign(availableSlots[id], {
        loading: true
      })));
    }, {});
    return this.getGoogletag().then(function (googletag) {
      Object.keys(availableSlots).forEach(function (currentSlotId) {
        availableSlots[currentSlotId].loading = false;
        googletag.cmd.push(function () {
          var slot = availableSlots[currentSlotId];
          var gptSlot;
          var adUnit = "".concat(slot.dfpNetworkId, "/").concat(slot.adUnit);

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
                if (slot && slot.gptSlot) {
                  slot.gptSlot.setTargeting(varName, slotTargetingArguments[varName]);
                }
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
        if (_this3.singleRequestIsEnabled()) {
          googletag.pubads().enableSingleRequest();
        }

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
          var pubadsService = googletag.pubads();
          pubadsService.setRequestNonPersonalizedAds(_this4.servePersonalizedAds() ? 0 : 1);
          pubadsService.refresh(Object.keys(slotsToRefresh).map(function (slotId) {
            return slotsToRefresh[slotId].gptSlot;
          }));
        });
      });
    }
  },
  destroyGPTSlots: function destroyGPTSlots() {
    for (var _len = arguments.length, slotsToDestroy = new Array(_len), _key = 0; _key < _len; _key++) {
      slotsToDestroy[_key] = arguments[_key];
    }

    var slots = slotsToDestroy.map(function (slotId) {
      return registeredSlots[slotId].gptSlot;
    });
    return this.getGoogletag().then(function (googletag) {
      googletag.cmd.push(function () {
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
      this.emit('slotRegistered', {
        slotId: slotId
      });

      if (loadAlreadyCalled === true) {
        this.load(slotId);
      }
    }
  },
  unregisterSlot: function unregisterSlot(_ref2) {
    var slotId = _ref2.slotId;
    this.destroyGPTSlots(slotId);
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
  },
  attachSlotIsViewable: function attachSlotIsViewable(cb) {
    this.on('impressionViewable', cb);
  },
  detachSlotIsViewable: function detachSlotIsViewable(cb) {
    this.removeListener('impressionViewable', cb);
  }
});
var _default = DFPManager;
exports.default = _default;