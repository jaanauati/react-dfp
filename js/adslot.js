import React from 'react';
import PropTypes from 'prop-types';

import { mapContextToAdSlotProps } from './utils';
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

  state = {
    slotId: this.props.slotId || null,
  };

  async componentDidMount() {
    await this.registerSlot();
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.hasOwnProperty('objectId')) {
      this.unregisterSlot();
      this.setState({ slotId: this.generateSlotId() });
      await this.registerSlot();
    }
  }

  componentWillUnmount() {
    this.unregisterSlot();
  }

  render() {
    return (
      <div className="adunitContainer">
        <div {...this.getAdProps()} />
      </div>
    );
  }

  getAdProps = () => ({
    className: "adBox",
    id: this.state.slotId
  });

  getSlotId = () => this.props.slotId || this.state.slotId;

  generateSlotId = () => `adSlot-${dynamicAdCount++}`;
  
  doRegisterSlot = async () => {
    await DFPManager.registerSlot({
      ...mapContextToAdSlotProps(this.context),
      ...this.props,
      ...this.state,
      slotShouldRefresh: this.slotShouldRefresh
    });

    if (this.props.fetchNow) {
      await DFPManager.load(this.getSlotId());
    }
    
    DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
  }

  registerSlot = async () => {
    if (this.state.slotId === null) {
      this.setState({ slotId: this.generateSlotId() }, this.doRegisterSlot);
    } else {
      await this.doRegisterSlot();
    }
  }

  unregisterSlot = () => {
    DFPManager.unregisterSlot({
      ...mapContextToAdSlotProps(this.context),
      ...this.props,
      ...this.state 
    });

    DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
  }

  slotRenderEnded = event => {
    if (event.slotId === this.getSlotId() && this.props.onSlotRender !== undefined) {
      this.props.onSlotRender(event);
    }
  }

  slotShouldRefresh = () => {
    if (this.props.shouldRefresh !== undefined) {
      return this.props.shouldRefresh({ 
        ...mapContextToAdSlotProps(this.context),
        ...this.props,
        slotId: this.getSlotId() 
      });
    }

    return true;
  }
}

export default AdSlot;
