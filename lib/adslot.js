"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AdSlot = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _manager = _interopRequireDefault(require("./manager"));

var _dfpslotsprovider = require("./dfpslotsprovider");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var dynamicAdCount = 0;

var AdSlot =
/*#__PURE__*/
function (_React$Component) {
  _inherits(AdSlot, _React$Component);

  function AdSlot(props) {
    var _this;

    _classCallCheck(this, AdSlot);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AdSlot).call(this, props));
    _this.doRegisterSlot = _this.doRegisterSlot.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.generateSlotId = _this.generateSlotId.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getSlotId = _this.getSlotId.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.mapContextToAdSlotProps = _this.mapContextToAdSlotProps.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.slotShouldRefresh = _this.slotShouldRefresh.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.slotRenderEnded = _this.slotRenderEnded.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.slotRegisterCallback = _this.slotRegisterCallback.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.slotIsViewable = _this.slotIsViewable.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.slotVisibilityChanged = _this.slotVisibilityChanged.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getClasses = _this.getClasses.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.state = {
      slotId: _this.props.slotId || null,
      className: _this.props.className || ''
    };
    _this.adElementRef = _react.default.createRef ? _react.default.createRef() : function (element) {
      _this.adElementRef = element;
    };
    return _this;
  }

  _createClass(AdSlot, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // register this ad-unit in the <DFPSlotProvider>, when available.
      if (this.context !== undefined && this.context.newSlotCallback) {
        this.context.newSlotCallback();
      }

      this.registerSlot();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.unregisterSlot();
    }
  }, {
    key: "getSlotId",
    value: function getSlotId() {
      return this.props.slotId || this.state.slotId;
    }
  }, {
    key: "getClasses",
    value: function getClasses() {
      var baseClass = 'adunitContainer';
      var extraClasses = this.state.className.split(' ');
      extraClasses.push(baseClass);
      return extraClasses;
    }
  }, {
    key: "generateSlotId",
    value: function generateSlotId() {
      return "adSlot-".concat(dynamicAdCount++);
    }
  }, {
    key: "mapContextToAdSlotProps",
    value: function mapContextToAdSlotProps() {
      var context = this.context;
      var mappedProps = {};

      if (context.dfpNetworkId !== undefined) {
        mappedProps.dfpNetworkId = context.dfpNetworkId;
      }

      if (context.dfpAdUnit !== undefined) {
        mappedProps.adUnit = context.dfpAdUnit;
      }

      if (context.dfpSizeMapping !== undefined) {
        mappedProps.sizeMapping = context.dfpSizeMapping;
      }

      if (context.dfpTargetingArguments !== undefined) {
        mappedProps.targetingArguments = context.dfpTargetingArguments;
      }

      return mappedProps;
    }
  }, {
    key: "doRegisterSlot",
    value: function doRegisterSlot() {
      _manager.default.registerSlot(_objectSpread({}, this.mapContextToAdSlotProps(), this.props, this.state, {
        slotShouldRefresh: this.slotShouldRefresh
      }));

      if (this.props.fetchNow === true) {
        _manager.default.load(this.getSlotId());
      }

      _manager.default.attachSlotRenderEnded(this.slotRenderEnded);

      _manager.default.attachSlotIsViewable(this.slotIsViewable);

      _manager.default.attachSlotVisibilityChanged(this.slotVisibilityChanged);

      this.slotRegisterCallback();
    }
  }, {
    key: "registerSlot",
    value: function registerSlot() {
      if (this.state.slotId === null) {
        this.setState({
          slotId: this.generateSlotId()
        }, this.doRegisterSlot);
      } else {
        this.doRegisterSlot();
      }
    }
  }, {
    key: "unregisterSlot",
    value: function unregisterSlot() {
      _manager.default.unregisterSlot(_objectSpread({}, this.mapContextToAdSlotProps(), this.props, this.state));

      _manager.default.detachSlotRenderEnded(this.slotRenderEnded);

      _manager.default.detachSlotIsViewable(this.slotIsViewable);

      _manager.default.detachSlotVisibilityChanged(this.slotVisibilityChanged);
    }
  }, {
    key: "slotRenderEnded",
    value: function slotRenderEnded(eventData) {
      if (eventData.slotId === this.getSlotId()) {
        if (this.props.onSlotRender !== undefined) {
          // now that slot has rendered we have access to the ref
          var params = _objectSpread({}, eventData, {
            adElementRef: this.adElementRef
          });

          this.props.onSlotRender(params);
        }
      }
    }
  }, {
    key: "slotRegisterCallback",
    value: function slotRegisterCallback() {
      if (typeof this.props.onSlotRegister === 'function') {
        this.props.onSlotRegister({
          slotId: this.getSlotId(),
          sizes: this.props.sizes,
          slotCount: dynamicAdCount,
          adElementRef: this.adElementRef
        });
      }
    }
  }, {
    key: "slotIsViewable",
    value: function slotIsViewable(eventData) {
      if (eventData.slotId === this.getSlotId()) {
        if (this.props.onSlotIsViewable !== undefined) {
          this.props.onSlotIsViewable(eventData);
        }
      }
    }
  }, {
    key: "slotVisibilityChanged",
    value: function slotVisibilityChanged(eventData) {
      if (eventData.slotId === this.getSlotId()) {
        if (this.props.onSlotVisibilityChanged !== undefined) {
          this.props.onSlotVisibilityChanged(eventData);
        }
      }
    }
  }, {
    key: "slotShouldRefresh",
    value: function slotShouldRefresh() {
      var r = true;

      if (this.props.shouldRefresh !== undefined) {
        r = this.props.shouldRefresh(_objectSpread({}, this.mapContextToAdSlotProps(), this.props, {
          slotId: this.getSlotId()
        }));
      }

      return r;
    }
  }, {
    key: "render",
    value: function render() {
      var slotId = this.state.slotId;
      var props = {
        className: 'adBox'
      };

      if (slotId !== null) {
        props.id = slotId;
      }

      return _react.default.createElement("div", {
        className: this.getClasses().join(' ').trim()
      }, _react.default.createElement("div", _extends({
        ref: this.adElementRef
      }, props)));
    }
  }]);

  return AdSlot;
}(_react.default.Component);

exports.AdSlot = AdSlot;

_defineProperty(AdSlot, "propTypes", {
  dfpNetworkId: _propTypes.default.string,
  adUnit: _propTypes.default.string,
  sizes: _propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.number), _propTypes.default.string])),
  renderOutOfThePage: _propTypes.default.bool,
  sizeMapping: _propTypes.default.arrayOf(_propTypes.default.object),
  fetchNow: _propTypes.default.bool,
  adSenseAttributes: _propTypes.default.object,
  targetingArguments: _propTypes.default.object,
  onSlotRender: _propTypes.default.func,
  onSlotRegister: _propTypes.default.func,
  onSlotIsViewable: _propTypes.default.func,
  onSlotVisibilityChanged: _propTypes.default.func,
  shouldRefresh: _propTypes.default.func,
  slotId: _propTypes.default.string,
  className: _propTypes.default.string
});

_defineProperty(AdSlot, "defaultProps", {
  fetchNow: false
});

if (_dfpslotsprovider.Context === null) {
  // React < 16.3
  AdSlot.contextTypes = {
    dfpNetworkId: _propTypes.default.string,
    dfpAdUnit: _propTypes.default.string,
    dfpSizeMapping: _propTypes.default.arrayOf(_propTypes.default.object),
    dfpTargetingArguments: _propTypes.default.object,
    newSlotCallback: _propTypes.default.func
  };
} else {
  AdSlot.contextType = _dfpslotsprovider.Context;
}

var _default = AdSlot;
exports.default = _default;