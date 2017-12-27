'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _events = require('events');

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DfpManager = function DfpManager() {
  var _this = this;

  (0, _classCallCheck3.default)(this, DfpManager);

  this.getAdSenseAttribute = function (key) {
    return _this.adSenseAttributes[key];
  };

  this.setAdSenseAttribute = function (key, value) {
    _this.setAdSenseAttributes((0, _defineProperty3.default)({}, key, value));
  };

  this.getAdSenseAttributes = function () {
    return _this.adSenseAttributes;
  };

  this.setAdSenseAttributes = function (values) {
    _this.adSenseAttributes = (0, _extends4.default)({}, _this.adSenseAttributes, values);

    if (_this.isManagerInitialized) {
      _this.getGoogletag().then(function (googleTag) {
        googleTag.cmd.push(function () {
          return Object.keys(_this.adSenseAttributes).forEach(function (key) {
            return googletag.pubads().set(key, _this.targetingArguments[key]);
          });
        });
      });
    }
  };

  this.setTargetingArguments = function (values) {
    _this.targetingArguments = (0, _extends4.default)({}, _this.targetingArguments, values);

    if (_this.isManagerInitialized) {
      _this.getGoogletag().then(function (googleTag) {
        googleTag.cmd.push(function () {
          var pubAds = googleTag.pubAds();

          Object.keys(_this.targetingArguments).forEach(function (key) {
            return pubAds.setTargeting(key, _this.targetingArguments[key]);
          });
        });
      });
    }
  };

  this.getSlotProperty = function (slotId, propName) {
    var slot = _this.getRegisteredSlots()[slotId];

    if (slot !== undefined) {
      return slot[propName] || null;
    }

    return null;
  };

  this.getSlotTargetingArguments = function (slotId) {
    var propValue = _this.getSlotProperty(slotId, 'targetingArguments');
    return propValue ? (0, _extends4.default)({}, propValue) : null;
  };

  this.getSlotAdSenseAttributes = function (slotId) {
    var propValue = _this.getSlotProperty(slotId, 'adSenseAttributes');
    return propValue ? (0, _extends4.default)({}, propValue) : null;
  };

  this.init = function () {
    if (_this.isManagerInitialized === false) {
      _this.isManagerInitialized = true;

      _this.getGoogletag().then(function (googleTag) {
        googleTag.cmd.push(function () {
          var pubAds = googleTag.pubads();

          pubAds.addEventListener('slotRenderEnded', function (ev) {
            return _this.eventEmitter.emit('slotRenderEnded', { slotId: ev.slot.getSlotElementId(), event: ev });
          });

          Object.keys(_this.targetingArguments).forEach(function (key) {
            return pubAds.setTargeting(key, _this.targetingArguments[key]);
          });

          Object.keys(_this.adSenseAttributes).forEach(function (key) {
            return pubAds.set(key, _this.adSenseAttributes[key]);
          });
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
      return (0, _extends4.default)(result, (0, _defineProperty3.default)({}, id, (0, _extends4.default)(availableSlots[id], { loading: true })));
    }, {});
  };

  this.load = function (slotId) {
    _this.init();

    var availableSlots = _this.getAvailableSlots(slotId);

    _this.getGoogletag().then(function (googleTag) {
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

            var slotAdSenseAttributes = _this.getSlotAdSenseAttributes(currentSlotId);

            if (slotAdSenseAttributes !== null) {
              Object.keys(slotAdSenseAttributes).forEach(function (key) {
                return slot.gptSlot.set(key, slotAdSenseAttributes[key]);
              });
            }

            if (slot.sizeMapping) {
              var smbuilder = googleTag.sizeMapping();

              slot.sizeMapping.forEach(function (_ref) {
                var viewport = _ref.viewport,
                    sizes = _ref.sizes;

                smbuilder = smbuilder.addSize(viewport, sizes);
              });

              slot.gptSlot.defineSizeMapping(smbuilder.build());
            }
          }
        });
      });

      googleTag.cmd.push(function () {
        googleTag.pubads().enableSingleRequest();

        if (_this.collapseEmptyDivs !== undefined || _this.collapseEmptyDivs !== null) {
          googleTag.pubads().collapseEmptyDivs(_this.collapseEmptyDivs);
        }

        googleTag.enableServices();

        Object.keys(availableSlots).forEach(function (id) {
          return googleTag.display(id);
        });
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
    _this.collapseEmptyDivs = shouldCollapse;
  };

  this.getTargetingArguments = function () {
    return _this.targetingArguments;
  };

  this.attachSlotRenderEnded = function (cb) {
    return _this.eventEmitter.on('slotRenderEnded', cb);
  };

  this.detachSlotRenderEnded = function (cb) {
    return _this.eventEmitter.removeListener('slotRenderEnded', cb);
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

  this.refresh = function () {
    if (_this.isLoadAlreadyCalled === false) {
      _this.load();
    } else {
      _this.getGoogletag().then(function (googleTag) {
        var slotsToRefresh = _this.getRefreshableSlots();
        var pubAds = googleTag.pubAds();

        googleTag.cmd.push(function () {
          return pubAds().refresh(Object.keys(slotsToRefresh).map(function (key) {
            return slotsToRefresh[key].gptSlot;
          }));
        });
      });
    }
  };

  this.registerSlot = function (values) {
    var dfpNetworkId = values.dfpNetworkId,
        adUnit = values.adUnit,
        adSenseAttributes = values.adSenseAttributes,
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
        adSenseAttributes: adSenseAttributes,
        targetingArguments: targetingArguments,
        sizeMapping: sizeMapping,
        slotShouldRefresh: slotShouldRefresh,
        loading: false
      };
    }

    if (_this.isLoadAlreadyCalled === true) {
      _this.load(slotId);
    }
  };

  this.eventEmitter = new _events.EventEmitter();
  this.eventEmitter.setMaxListeners(0);

  this.registeredSlots = {};
  this.adSenseAttributes = {};
  this.targetingArguments = {};
  this.collapseEmptyDivs = false;
  this.isLoadAlreadyCalled = false;
  this.isManagerInitialized = false;
  this.googleTagPromise = Utils.loadGPTScript();
};

exports.default = new DfpManager();
