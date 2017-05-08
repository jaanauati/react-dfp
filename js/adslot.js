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
    targetingArguments: PropTypes.object,
    onSlotRender: PropTypes.func,
    shouldRefresh: PropTypes.func,
    slotId: PropTypes.string,
    objectId: PropTypes.string,
  };

  static contextTypes = {
    dfpNetworkId: PropTypes.string,
    dfpAdUnit: PropTypes.string,
    dfpSizeMapping: PropTypes.arrayOf(PropTypes.object),
    dfpTargetingArguments: PropTypes.object,
  };

  static defaultProps = {
    fetchNow: false,
  };

  constructor(props) {
    super(props);
    this.generateSlotId = this.generateSlotId.bind(this);
    this.getSlotId = this.getSlotId.bind(this);
    this.mapContextToAdSlotProps = this.mapContextToAdSlotProps.bind(this);
    this.slotShouldRefresh = this.slotShouldRefresh.bind(this);
    this.slotRenderEnded = this.slotRenderEnded.bind(this);
    this.state = {
      slotId: this.props.slotId || this.generateSlotId(),
    };
  }

  componentDidMount() {
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

  registerSlot() {
    DFPManager.registerSlot({
      ...this.mapContextToAdSlotProps(),
      ...this.props,
      ...this.state,
      slotShouldRefresh: this.slotShouldRefresh });
    if (this.props.fetchNow === true) {
      DFPManager.load(this.getSlotId());
    }
    DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
  }

  unregisterSlot() {
    DFPManager.unregisterSlot({
      ...this.mapContextToAdSlotProps(),
      ...this.props,
      ...this.state });
    DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
  }

  slotRenderEnded(eventData) {
    if (eventData.slotId === this.getSlotId()) {
      if (this.props.onSlotRender !== undefined) {
        this.props.onSlotRender(eventData);
      }
    }
  }

  slotShouldRefresh() {
    let r = true;
    if (this.props.shouldRefresh !== undefined) {
      r = this.props.shouldRefresh({ ...this.mapContextToAdSlotProps(),
        ...this.props,
        slotId: this.getSlotId() });
    }
    return r;
  }

  render() {
    return (
      <div className="adunitContainer"> <div id={this.state.slotId} className="adBox" /> </div>
    );
  }
}

export default AdSlot;
