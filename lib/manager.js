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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DfpManager = function DfpManager() {
  var _this = this;

  _classCallCheck(this, DfpManager);

  this.setTargetingArguments = async function (values) {
    _this.targetingArguments = _extends({}, _this.targetingArguments, values);

    if (_this.isManagerInitialized) {
      var googleTag = await _this.getGoogletag();

      googleTag.cmd.push(function () {
        var pubAds = googleTag.pubAds();

        Object.keys(_this.targetingArguments).forEach(function (key) {
          return pubAds.setTargeting(key, _this.targetingArguments[key]);
        });
      });
    }
  };

  this.getSlotTargetingArguments = function (slotId) {
    var slot = _this.getRegisteredSlots()[slotId];

    if (slot !== undefined && slot.targetingArguments !== undefined && slot.targetingArguments !== null && Object.keys(slot.targetingArguments).length > 0) {
      return slot.targetingArguments;
    }

    return null;
  };

  this.init = async function () {
    if (_this.isManagerInitialized === false) {
      _this.isManagerInitialized = true;

      var googleTag = await _this.getGoogletag();

      googletag.cmd.push(function () {
        var pubAds = googletag.pubads();

        pubAds.addEventListener('slotRenderEnded', function (ev) {
          return _this.eventEmitter.emit('slotRenderEnded', { slotId: ev.slot.getSlotElementId(), event: ev });
        });

        Object.keys(_this.targetingArguments).forEach(function (key) {
          return pubAds.setTargeting(key, _this.targetingArguments[key]);
        });
      });
    }
  };

  this.getAvailableSlots = function (slotId) {
    var availableSlots = {};

    if (_this.isLoadAlreadyCalled) {
      var slot = _this.registeredSlots[slotId];

      if (slot !== undefined) {
        availableSlots[slotId] = slot;
      }
    } else {
      availableSlots = _this.registeredSlots;
    }

    return Object.keys(availableSlots).filter(function (id) {
      return !availableSlots[id].loading;
    }).reduce(function (result, id) {
      return _extends(result, _defineProperty({}, id, _extends(availableSlots[id], { loading: true })));
    }, {});
  };

  this.load = async function (slotId) {
    await _this.init();

    var availableSlots = _this.getAvailableSlots(slotId);
    var googleTag = await _this.getGoogletag();

    Object.keys(availableSlots).forEach(function (currentSlotId) {
      availableSlots[currentSlotId].loading = false;

      googleTag.cmd.push(function () {
        var slot = availableSlots[currentSlotId];
        var adUnit = slot.dfpNetworkId + '/' + slot.adUnit;
        var gptSlot = void 0;

        if (slot.renderOutOfThePage) {
          gptSlot = googleTag.defineOutOfPageSlot(adUnit, currentSlotId);
        } else {
          gptSlot = googleTag.defineSlot(adUnit, slot.sizes, currentSlotId);
        }

        slot.gptSlot = gptSlot;

        if (slot.gptSlot) {
          Object.keys(_this.slotTargetingArguments).forEach(function (key) {
            return slot.gptSlot.setTargeting(key, _this.slotTargetingArguments[key]);
          });
          slot.gptSlot.addService(googleTag.pubads());
        }

        if (slot.sizeMapping) {
          var smbuilder = googleTag.sizeMapping();

          slot.sizeMapping.forEach(function (_ref) {
            var viewport = _ref.viewport,
                sizes = _ref.sizes;
            return smbuilder = smbuilder.addSize(viewport, sizes);
          });
          slot.gptSlot.defineSizeMapping(smbuilder.build());
        }
      });
    });

    googleTag.cmd.push(function () {
      googleTag.pubads().enableSingleRequest();

      if (_this.collapseEmptyDivs !== undefined || _this.collapseEmptyDivs !== null) {
        googleTag.pubads().collapseEmptyDivs(_this.collapseEmptyDivs);
      }

      googleTag.enableServices();

      Object.keys(availableSlots).forEach(function (slotId) {
        return googleTag.display(slotId);
      });
    });

    _this.isLoadAlreadyCalled = true;
  };

  this.getGoogletag = function () {
    if (_this.googleTagPromise === null) {
      _this.googleTagPromise = Utils.loadGPTScript();
    }

    return _this.googleTagPromise;
  };

  this.setCollapseEmptyDivs = function (shouldCollapse) {
    return _this.collapseEmptyDivs = shouldCollapse;
  };

  this.getTargetingArguments = function () {
    return _extends({}, _this.targetingArguments);
  };

  this.attachSlotRenderEnded = function (callback) {
    return _this.eventEmitter.on('slotRenderEnded', callback);
  };

  this.detachSlotRenderEnded = function (callback) {
    return _this.eventEmitter.removeListener('slotRenderEnded', callback);
  };

  this.getRegisteredSlots = function () {
    return _this.registeredSlots;
  };

  this.unregisterSlot = function (_ref2) {
    var slotId = _ref2.slotId;
    return delete _this.registeredSlots[slotId];
  };

  this.getRefreshableSlots = function () {
    var slotsToRefresh = Object.keys(_this.registeredSlots).map(function (key) {
      return _this.registeredSlots[key];
    });
    var slotsReducer = function slotsReducer(acc, it) {
      if (it.slotShouldRefresh()) {
        acc[it.slotId] = it;
      }

      return acc;
    };

    return slotsToRefresh.reduce(slotsReducer, {});
  };

  this.refresh = async function () {
    if (_this.isLoadAlreadyCalled === false) {
      await _this.load();
    } else {
      var googleTag = await _this.getGoogletag();
      var slotsToRefresh = _this.getRefreshableSlots();
      var pubAds = googleTag.pubAds();

      googleTag.cmd.push(function () {
        return pubAds().refresh(Object.keys(slotsToRefresh).map(function (key) {
          return slotsToRefresh[key].gptSlot;
        }));
      });
    }
  };

  this.registerSlot = async function (values) {
    var dfpNetworkId = values.dfpNetworkId,
        adUnit = values.adUnit,
        sizes = values.sizes,
        renderOutOfThePage = values.renderOutOfThePage,
        sizeMapping = values.sizeMapping,
        targetingArguments = values.targetingArguments,
        slotId = values.slotId,
        slotShouldRefresh = values.slotShouldRefresh;


    if (!_this.registeredSlots.hasOwnProperty(slotId)) {
      _this.registeredSlots[slotId] = {
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

    if (_this.isLoadAlreadyCalled === true) {
      await _this.load(slotId);
    }
  };

  this.eventEmitter = new _events.EventEmitter();
  this.eventEmitter.setMaxListeners(0);

  this.registeredSlots = {};
  this.targetingArguments = {};
  this.collapseEmptyDivs = false;
  this.isLoadAlreadyCalled = false;
  this.isManagerInitialized = false;
  this.googleTagPromise = Utils.loadGPTScript();
};

exports.default = new DfpManager();
