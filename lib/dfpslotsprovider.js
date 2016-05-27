'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DFPSlotsProvider = undefined;

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _manager = require('./manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DFPSlotsProvider = exports.DFPSlotsProvider = _react2.default.createClass({
  displayName: 'DFPSlotsProvider',

  propTypes: {
    children: _react2.default.PropTypes.element.isRequired,
    autoLoad: _react2.default.PropTypes.bool,
    dfpNetworkId: _react2.default.PropTypes.string.isRequired,
    adUnit: _react2.default.PropTypes.string,
    sizeMapping: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.object),
    targetingArguments: _react2.default.PropTypes.object
  },

  childContextTypes: {
    dfpNetworkId: _react2.default.PropTypes.string,
    dfpAdUnit: _react2.default.PropTypes.string,
    dfpSizeMapping: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.object),
    dfpTargetingArguments: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      autoLoad: true
    };
  },
  getChildContext: function getChildContext() {
    return {
      dfpNetworkId: this.props.dfpNetworkId,
      dfpAdUnit: this.props.adUnit,
      dfpSizeMapping: this.props.sizeMapping,
      dfpTargetingArguments: this.props.targetingArguments
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.props.autoLoad) {
      _manager.DFPManager.load();
    }
  },
  render: function render() {
    return _jsx('div', {}, void 0, ' ', this.props.children, ' ');
  }
});
