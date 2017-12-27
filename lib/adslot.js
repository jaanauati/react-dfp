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

var _utils = require('./utils');

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dynamicAdCount = 0;

var AdSlot = exports.AdSlot = function (_React$Component) {
  _inherits(AdSlot, _React$Component);

  function AdSlot() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AdSlot);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AdSlot.__proto__ || Object.getPrototypeOf(AdSlot)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      slotId: _this.props.slotId || null
    }, _this.getAdProps = function () {
      return {
        className: "adBox",
        id: _this.state.slotId
      };
    }, _this.getSlotId = function () {
      return _this.props.slotId || _this.state.slotId;
    }, _this.generateSlotId = function () {
      return 'adSlot-' + dynamicAdCount++;
    }, _this.doRegisterSlot = function () {
      _manager2.default.registerSlot(_extends({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, _this.state, {
        slotShouldRefresh: _this.slotShouldRefresh
      }));

      if (_this.props.fetchNow) {
        _manager2.default.load(_this.getSlotId());
      }

      _manager2.default.attachSlotRenderEnded(_this.slotRenderEnded);
    }, _this.registerSlot = function () {
      if (_this.state.slotId === null) {
        _this.setState({ slotId: _this.generateSlotId() });
      }

      _this.doRegisterSlot();
    }, _this.unregisterSlot = function () {
      _manager2.default.unregisterSlot(_extends({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, _this.state));

      _manager2.default.detachSlotRenderEnded(_this.slotRenderEnded);
    }, _this.slotRenderEnded = function (event) {
      if (event.slotId === _this.getSlotId() && _this.props.onSlotRender !== undefined) {
        _this.props.onSlotRender(event);
      }
    }, _this.slotShouldRefresh = function () {
      if (_this.props.shouldRefresh !== undefined) {
        return _this.props.shouldRefresh(_extends({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, {
          slotId: _this.getSlotId()
        }));
      }

      return true;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AdSlot, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.registerSlot();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.hasOwnProperty('objectId')) {
        this.unregisterSlot();
        this.setState({ slotId: this.generateSlotId() });
        this.registerSlot();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unregisterSlot();
    }
  }, {
    key: 'render',
    value: function render() {
      return _jsx('div', {
        className: 'adunitContainer'
      }, void 0, _react2.default.createElement('div', this.getAdProps()));
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
