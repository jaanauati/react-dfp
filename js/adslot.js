import React from 'react';
import PropTypes from 'prop-types';
import DFPManager from './manager';

let dynamicAdCount = 0;

export class AdSlot extends React.Component {
  static propTypes = {
    dfpNetworkId: PropTypes.string,
    adUnit: PropTypes.string,
    sizes: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.string,
      ]),
    ),
    renderOutOfThePage: PropTypes.bool,
    sizeMapping: PropTypes.arrayOf(PropTypes.object),
    fetchNow: PropTypes.bool,
    adSenseAttributes: PropTypes.object,
    targetingArguments: PropTypes.object,
    onSlotRender: PropTypes.func,
    onSlotIsViewable: PropTypes.func,
    shouldRefresh: PropTypes.func,
    slotId: PropTypes.string,
    objectId: PropTypes.string,
  };

  static contextTypes = {
    dfpNetworkId: PropTypes.string,
    dfpAdUnit: PropTypes.string,
    dfpSizeMapping: PropTypes.arrayOf(PropTypes.object),
    dfpTargetingArguments: PropTypes.object,
    newSlotCallback: PropTypes.func,
  };

  static defaultProps = {
    fetchNow: false,
  };

  constructor(props) {
    super(props);
    this.doRegisterSlot = this.doRegisterSlot.bind(this);
    this.generateSlotId = this.generateSlotId.bind(this);
    this.getSlotId = this.getSlotId.bind(this);
    this.mapContextToAdSlotProps = this.mapContextToAdSlotProps.bind(this);
    this.slotShouldRefresh = this.slotShouldRefresh.bind(this);
    this.slotRenderEnded = this.slotRenderEnded.bind(this);
    this.slotIsViewable = this.slotIsViewable.bind(this);
    this.state = {
      slotId: this.props.slotId || null,
    };
  }

  componentDidMount() {
    // register this ad-unit in the <DFPSlotProvider>, when available.
    if (typeof this.context !== 'undefined' && typeof this.context.newSlotCallback !== 'undefined') {
      this.context.newSlotCallback();
    }
    this.registerSlot();
  }

  componentWillReceiveProps(nextProps) {
    if (Object.prototype.hasOwnProperty.call(nextProps, 'objectId')) {
      const state = this.state;
      state.slotId = this.generateSlotId();
      this.unregisterSlot();
      this.setState(state);
      this.registerSlot();
    }
  }

  componentWillUnmount() {
    this.unregisterSlot();
  }

  getSlotId() {
    return this.props.slotId || this.state.slotId;
  }

  generateSlotId() {
    return `adSlot-${dynamicAdCount++}`;
  }

  mapContextToAdSlotProps() {
    const context = this.context;
    const mappedProps = {};
    if (typeof context.dfpNetworkId !== 'undefined') {
      mappedProps.dfpNetworkId = context.dfpNetworkId;
    }
    if (typeof context.dfpAdUnit !== 'undefined') {
      mappedProps.adUnit = context.dfpAdUnit;
    }
    if (typeof context.dfpSizeMapping !== 'undefined') {
      mappedProps.sizeMapping = context.dfpSizeMapping;
    }
    if (typeof context.dfpTargetingArguments !== 'undefined') {
      mappedProps.targetingArguments = context.dfpTargetingArguments;
    }
    return mappedProps;
  }

  doRegisterSlot() {
    DFPManager.registerSlot({
      ...this.mapContextToAdSlotProps(),
      ...this.props,
      ...this.state,
      slotShouldRefresh: this.slotShouldRefresh,
    });
    if (this.props.fetchNow === true) {
      DFPManager.load(this.getSlotId());
    }
    DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
    DFPManager.attachSlotIsViewable(this.slotIsViewable);
  }

  registerSlot() {
    if (this.state.slotId === null) {
      this.setState({
        slotId: this.generateSlotId(),
      }, this.doRegisterSlot);
    } else {
      this.doRegisterSlot();
    }
  }

  unregisterSlot() {
    DFPManager.unregisterSlot({
      ...this.mapContextToAdSlotProps(),
      ...this.props,
      ...this.state });
    DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
    DFPManager.detachSlotIsViewable(this.slotIsViewable);
  }

  slotRenderEnded(eventData) {
    if (eventData.slotId === this.getSlotId()) {
      if (this.props.onSlotRender !== 'undefined') {
        this.props.onSlotRender(eventData);
      }
    }
  }

  slotIsViewable(eventData) {
    if (eventData.slotId === this.getSlotId()) {
      if (typeof this.props.onSlotIsViewable !== 'undefined') {
        this.props.onSlotIsViewable(eventData);
      }
    }
  }

  slotShouldRefresh() {
    let r = true;
    if (typeof this.props.shouldRefresh !== 'undefined') {
      r = this.props.shouldRefresh({ ...this.mapContextToAdSlotProps(),
        ...this.props,
        slotId: this.getSlotId() });
    }
    return r;
  }

  render() {
    const { slotId } = this.state;
    const props = { className: 'adBox' };
    if (slotId !== null) {
      props.id = slotId;
    }
    return (
      <div className="adunitContainer">
        <div {...props} />
      </div>
    );
  }
}

export default AdSlot;
