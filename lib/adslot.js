'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdSlot = undefined;

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _manager = require('./manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AdSlot = exports.AdSlot = _react2.default.createClass({
  displayName: 'AdSlot',

  propTypes: {
    dfpNetworkId: _react2.default.PropTypes.string,
    adUnit: _react2.default.PropTypes.string,
    sizes: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.arrayOf(_react2.default.PropTypes.number)),
    renderOutOfThePage: _react2.default.PropTypes.bool,
    sizeMapping: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.object),
    fetchNow: _react2.default.PropTypes.bool,
    targetingArguments: _react2.default.PropTypes.object,
    onSlotRender: _react2.default.PropTypes.func,
    shouldRefresh: _react2.default.PropTypes.func,
    slotId: _react2.default.PropTypes.string
  },

  contextTypes: {
    dfpNetworkId: _react2.default.PropTypes.string,
    dfpAdUnit: _react2.default.PropTypes.string,
    dfpSizeMapping: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.object),
    dfpTargetingArguments: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fetchNow: false
    };
  },
  getInitialState: function getInitialState() {
    return { slotId: this.generateSlotId() };
  },
  componentDidMount: function componentDidMount() {
    this.registerSlot();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.hasOwnProperty('objectId')) {
      var state = this.state;
      state.slotId = this.generateSlotId();
      this.unregisterSlot();
      this.setState(state);
      this.registerSlot();
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.unregisterSlot();
  },
  getSlotId: function getSlotId() {
    return this.props.slotId || this.state.slotId;
  },
  generateSlotId: function generateSlotId() {
    var slotId = this.props.slotId;
    if (slotId === undefined) {
      var seconds = (Date.now && Date.now() || new Date().getTime()) / 1000;
      slotId = 'adSlot-' + seconds;
    }
    return slotId;
  },
  mapContextToAdSlotProps: function mapContextToAdSlotProps() {
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
  },
  registerSlot: function registerSlot() {
    _manager.DFPManager.registerSlot(_extends({}, this.mapContextToAdSlotProps(), this.props, this.state, {
      slotShouldRefresh: this.slotShouldRefresh }));
    if (this.props.fetchNow === true) {
      _manager.DFPManager.load(this.getSlotId());
    }
    _manager.DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
  },
  unregisterSlot: function unregisterSlot() {
    _manager.DFPManager.unregisterSlot(_extends({}, this.mapContextToAdSlotProps(), this.props, this.state));
    _manager.DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
  },
  slotRenderEnded: function slotRenderEnded(eventData) {
    if (eventData.slotId === this.getSlotId()) {
      if (this.props.onSlotRender !== undefined) {
        this.props.onSlotRender(eventData);
      }
    }
  },
  slotShouldRefresh: function slotShouldRefresh() {
    var r = true;
    if (this.props.shouldRefresh !== undefined) {
      r = this.props.shouldRefresh(_extends({}, this.mapContextToAdSlotProps(), this.props, { slotId: this.getSlotId() }));
    }
    return r;
  },
  render: function render() {
    return _jsx('div', {
      className: 'adunitContainer'
    }, void 0, ' ', _jsx('div', {
      id: this.getSlotId(),
      className: 'adBox'
    }), ' ');
  }
});
