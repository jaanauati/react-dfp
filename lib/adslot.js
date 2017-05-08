'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdSlot = undefined;

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dynamicAdCount = 0;

var AdSlot = exports.AdSlot = function (_React$Component) {
  _inherits(AdSlot, _React$Component);

  function AdSlot(props) {
    _classCallCheck(this, AdSlot);

    var _this = _possibleConstructorReturn(this, (AdSlot.__proto__ || Object.getPrototypeOf(AdSlot)).call(this, props));

    _this.generateSlotId = _this.generateSlotId.bind(_this);
    _this.getSlotId = _this.getSlotId.bind(_this);
    _this.mapContextToAdSlotProps = _this.mapContextToAdSlotProps.bind(_this);
    _this.slotShouldRefresh = _this.slotShouldRefresh.bind(_this);
    _this.slotRenderEnded = _this.slotRenderEnded.bind(_this);
    _this.state = {
      slotId: _this.props.slotId || _this.generateSlotId()
    };
    return _this;
  }

  _createClass(AdSlot, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.registerSlot();
    }
  }, {
    key: 'componentWillReceiveProps',
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
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unregisterSlot();
    }
  }, {
    key: 'getSlotId',
    value: function getSlotId() {
      return this.props.slotId || this.state.slotId;
    }
  }, {
    key: 'generateSlotId',
    value: function generateSlotId() {
      return 'adSlot-' + dynamicAdCount++;
    }
  }, {
    key: 'mapContextToAdSlotProps',
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
    key: 'registerSlot',
    value: function registerSlot() {
      _manager2.default.registerSlot(_extends({}, this.mapContextToAdSlotProps(), this.props, this.state, {
        slotShouldRefresh: this.slotShouldRefresh }));
      if (this.props.fetchNow === true) {
        _manager2.default.load(this.getSlotId());
      }
      _manager2.default.attachSlotRenderEnded(this.slotRenderEnded);
    }
  }, {
    key: 'unregisterSlot',
    value: function unregisterSlot() {
      _manager2.default.unregisterSlot(_extends({}, this.mapContextToAdSlotProps(), this.props, this.state));
      _manager2.default.detachSlotRenderEnded(this.slotRenderEnded);
    }
  }, {
    key: 'slotRenderEnded',
    value: function slotRenderEnded(eventData) {
      if (eventData.slotId === this.getSlotId()) {
        if (this.props.onSlotRender !== undefined) {
          this.props.onSlotRender(eventData);
        }
      }
    }
  }, {
    key: 'slotShouldRefresh',
    value: function slotShouldRefresh() {
      var r = true;
      if (this.props.shouldRefresh !== undefined) {
        r = this.props.shouldRefresh(_extends({}, this.mapContextToAdSlotProps(), this.props, {
          slotId: this.getSlotId() }));
      }
      return r;
    }
  }, {
    key: 'render',
    value: function render() {
      return _jsx('div', {
        className: 'adunitContainer'
      }, void 0, ' ', _jsx('div', {
        id: this.state.slotId,
        className: 'adBox'
      }), ' ');
    }
  }]);

  return AdSlot;
}(_react2.default.Component);

AdSlot.propTypes = {
  dfpNetworkId: _propTypes2.default.string,
  adUnit: _propTypes2.default.string,
  sizes: _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.number), _propTypes2.default.string])),
  renderOutOfThePage: _propTypes2.default.bool,
  sizeMapping: _propTypes2.default.arrayOf(_propTypes2.default.object),
  fetchNow: _propTypes2.default.bool,
  targetingArguments: _propTypes2.default.object,
  onSlotRender: _propTypes2.default.func,
  shouldRefresh: _propTypes2.default.func,
  slotId: _propTypes2.default.string,
  objectId: _propTypes2.default.string
};
AdSlot.contextTypes = {
  dfpNetworkId: _propTypes2.default.string,
  dfpAdUnit: _propTypes2.default.string,
  dfpSizeMapping: _propTypes2.default.arrayOf(_propTypes2.default.object),
  dfpTargetingArguments: _propTypes2.default.object
};
AdSlot.defaultProps = {
  fetchNow: false
};
exports.default = AdSlot;
