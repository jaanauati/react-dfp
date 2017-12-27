'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdSlot = undefined;

var _jsx2 = require('babel-runtime/helpers/jsx');

var _jsx3 = _interopRequireDefault(_jsx2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('./utils');

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dynamicAdCount = 0;

var AdSlot = exports.AdSlot = function (_React$Component) {
  (0, _inherits3.default)(AdSlot, _React$Component);

  function AdSlot() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, AdSlot);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = AdSlot.__proto__ || Object.getPrototypeOf(AdSlot)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      slotId: _this.props.slotId || null
    }, _this.getAdProps = function () {
      return {
        className: 'adBox',
        id: _this.state.slotId
      };
    }, _this.getSlotId = function () {
      return _this.props.slotId || _this.state.slotId;
    }, _this.generateSlotId = function () {
      return 'adSlot-' + dynamicAdCount++;
    }, _this.doRegisterSlot = function () {
      _manager2.default.registerSlot((0, _extends3.default)({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, _this.state, {
        slotShouldRefresh: _this.slotShouldRefresh
      }));

      if (_this.props.fetchNow) {
        _manager2.default.load(_this.getSlotId());
      }

      _manager2.default.attachSlotRenderEnded(_this.slotRenderEnded);
    }, _this.registerSlot = function () {
      if (_this.state.slotId === null) {
        _this.setState({
          slotId: _this.generateSlotId()
        });
      }

      _this.doRegisterSlot();
    }, _this.unregisterSlot = function () {
      _manager2.default.unregisterSlot((0, _extends3.default)({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, _this.state));

      _manager2.default.detachSlotRenderEnded(_this.slotRenderEnded);
    }, _this.slotRenderEnded = function (event) {
      if (event.slotId === _this.getSlotId() && _this.props.onSlotRender !== undefined) {
        _this.props.onSlotRender(event);
      }
    }, _this.slotShouldRefresh = function () {
      if (_this.props.shouldRefresh !== undefined) {
        return _this.props.shouldRefresh((0, _extends3.default)({}, (0, _utils.mapContextToAdSlotProps)(_this.context), _this.props, {
          slotId: _this.getSlotId()
        }));
      }

      return true;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(AdSlot, [{
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
      return (0, _jsx3.default)('div', {
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
  adSenseAttributes: _propTypes2.default.object,
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
