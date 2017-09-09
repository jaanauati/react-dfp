'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

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

var DFPSlotsProvider = function (_React$Component) {
  _inherits(DFPSlotsProvider, _React$Component);

  function DFPSlotsProvider() {
    _classCallCheck(this, DFPSlotsProvider);

    return _possibleConstructorReturn(this, (DFPSlotsProvider.__proto__ || Object.getPrototypeOf(DFPSlotsProvider)).apply(this, arguments));
  }

  _createClass(DFPSlotsProvider, [{
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
      _manager2.default.setCollapseEmptyDivs(this.props.collapseEmptyDivs);

      if (this.props.autoLoad) {
        _manager2.default.load();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _jsx('div', {}, void 0, ' ', this.props.children, ' ');
    }
  }]);

  return DFPSlotsProvider;
}(_react2.default.Component);

DFPSlotsProvider.propTypes = {
  children: _propTypes2.default.element.isRequired,
  autoLoad: _propTypes2.default.bool,
  dfpNetworkId: _propTypes2.default.string.isRequired,
  adUnit: _propTypes2.default.string,
  sizeMapping: _propTypes2.default.arrayOf(_propTypes2.default.object),
  targetingArguments: _propTypes2.default.object,
  collapseEmptyDivs: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.object])
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
