"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AdSlot = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _manager = _interopRequireDefault(require("./manager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
    _this.slotIsViewable = _this.slotIsViewable.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.state = {
      slotId: _this.props.slotId || null
    };
    return _this;
  }

  _createClass(AdSlot, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // register this ad-unit in the <DFPSlotProvider>, when available.
      if (this.context !== undefined && this.context.newSlotCallback !== undefined) {
        this.context.newSlotCallback();
      }

      this.registerSlot();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (Object.prototype.hasOwnProperty.call(nextProps, 'objectId')) {
        var state = this.state;
        state.slotId = this.generateSlotId();
        this.unregisterSlot();
        this.setState(state);
        this.registerSlot();
      }
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
    }
  }, {
    key: "slotRenderEnded",
    value: function slotRenderEnded(eventData) {
      if (eventData.slotId === this.getSlotId()) {
        if (this.props.onSlotRender !== undefined) {
          this.props.onSlotRender(eventData);
        }
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
        className: "adunitContainer"
      }, _react.default.createElement("div", props));
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
  onSlotIsViewable: _propTypes.default.func,
  shouldRefresh: _propTypes.default.func,
  slotId: _propTypes.default.string,
  objectId: _propTypes.default.string
});

_defineProperty(AdSlot, "contextTypes", {
  dfpNetworkId: _propTypes.default.string,
  dfpAdUnit: _propTypes.default.string,
  dfpSizeMapping: _propTypes.default.arrayOf(_propTypes.default.object),
  dfpTargetingArguments: _propTypes.default.object,
  newSlotCallback: _propTypes.default.func
});

_defineProperty(AdSlot, "defaultProps", {
  fetchNow: false
});

var _default = AdSlot;
exports.default = _default;