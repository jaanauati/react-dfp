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

  function DFPSlotsProvider(props) {
    _classCallCheck(this, DFPSlotsProvider);

    var _this = _possibleConstructorReturn(this, (DFPSlotsProvider.__proto__ || Object.getPrototypeOf(DFPSlotsProvider)).call(this, props));

    _this.loadAdsIfPossible = _this.loadAdsIfPossible.bind(_this);
    _this.newSlotCallback = _this.newSlotCallback.bind(_this);
    _this.totalSlots = 0;
    return _this;
  }

  _createClass(DFPSlotsProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        dfpNetworkId: this.props.dfpNetworkId,
        dfpAdUnit: this.props.adUnit,
        dfpSizeMapping: this.props.sizeMapping,
        dfpTargetingArguments: this.props.targetingArguments,
        newSlotCallback: this.newSlotCallback
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _manager2.default.setAdSenseAttributes(this.props.adSenseAttributes);
      _manager2.default.setCollapseEmptyDivs(this.props.collapseEmptyDivs);
      if (!this.loadAdsIfPossible()) {
        _manager2.default.on('slotRegistered', this.loadAdsIfPossible);
      }
    }

    // pretty strait-forward interface that children ads use to register
    // with their DFPSlotProvider parent node.

  }, {
    key: 'newSlotCallback',
    value: function newSlotCallback() {
      this.totalSlots++;
    }

    // Checks all the mounted children ads have been already registered
    // in the DFPManager before trying to call the gpt load scripts.
    // This is helpful when trying to fetch ads with a single request.

  }, {
    key: 'loadAdsIfPossible',
    value: function loadAdsIfPossible() {
      var r = false;
      if (Object.keys(_manager2.default.getRegisteredSlots()).length >= this.totalSlots) {
        _manager2.default.removeListener('slotRegistered', this.loadAdsIfPossible);
        _manager2.default.load();
        r = true;
      }
      return r;
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
  children: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.array]).isRequired,
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
  dfpTargetingArguments: _propTypes2.default.object,
  newSlotCallback: _propTypes2.default.func
};
DFPSlotsProvider.defaultProps = {
  autoLoad: true,
  collapseEmptyDivs: null
};
exports.default = DFPSlotsProvider;
