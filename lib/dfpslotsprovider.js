'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DFPSlotsProvider = function (_React$Component) {
  (0, _inherits3.default)(DFPSlotsProvider, _React$Component);

  function DFPSlotsProvider() {
    (0, _classCallCheck3.default)(this, DFPSlotsProvider);
    return (0, _possibleConstructorReturn3.default)(this, (DFPSlotsProvider.__proto__ || Object.getPrototypeOf(DFPSlotsProvider)).apply(this, arguments));
  }

  (0, _createClass3.default)(DFPSlotsProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        dfpNetworkId: this.props.dfpNetworkId,
        dfpAdUnit: this.props.adUnit,
        dfpSizeMapping: this.props.sizeMapping,
        dfpTargetingArguments: this.props.targetingArguments
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _manager2.default.setAdSenseAttributes(this.props.adSenseAttributes);
      _manager2.default.setCollapseEmptyDivs(this.props.collapseEmptyDivs);

      if (this.props.autoLoad) {
        _manager2.default.load();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);
  return DFPSlotsProvider;
}(_react2.default.Component);

DFPSlotsProvider.propTypes = {
  children: _propTypes2.default.any.isRequired,
  autoLoad: _propTypes2.default.bool,
  dfpNetworkId: _propTypes2.default.string.isRequired,
  adUnit: _propTypes2.default.string,
  sizeMapping: _propTypes2.default.arrayOf(_propTypes2.default.object),
  adSenseAttributes: _propTypes2.default.object,
  targetingArguments: _propTypes2.default.object,
  collapseEmptyDivs: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.object]),
  adSenseAttrs: _propTypes2.default.object
};
DFPSlotsProvider.childContextTypes = {
  dfpNetworkId: _propTypes2.default.string,
  dfpAdUnit: _propTypes2.default.string,
  dfpSizeMapping: _propTypes2.default.arrayOf(_propTypes2.default.object),
  dfpTargetingArguments: _propTypes2.default.object
};
DFPSlotsProvider.defaultProps = {
  autoLoad: true,
  collapseEmptyDivs: null
};
exports.default = DFPSlotsProvider;
