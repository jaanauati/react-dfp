
import React from 'react';
import {DFPManager} from './manager';


export const AdSlot = React.createClass({
  displayName: 'AdSlot',

  propTypes: {
    dfpNetworkId: React.PropTypes.string.isRequired,
    adUnit: React.PropTypes.string.isRequired,
    sizes: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ).isRequired,
    targetingArguments: React.PropTypes.object,
    onSlotRender: React.PropTypes.func,
    shouldRefresh: React.PropTypes.func,
    slotId: React.PropTypes.string,
  },
  
  getDefaultProps() {
    let seconds = (Date.now && Date.now() || new Date().getTime()) / 1000;
    return {
      slotId: `adSlot-${seconds}`,
    };
  },
  
  componentDidMount() {
    const slotData = Object.assign({slotShouldRefresh: this.slotShouldRefresh}, this.props);
    DFPManager.registerSlot(slotData);
    DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
  },

  render() {
    return (
      <div className="adunitContainer"> <div id={this.props.slotId} className="adBox" /> </div>
    );
  },

  componentWillUmount() {
    DFPManager.unregisterSlot(this.props);
    DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
  },

  slotRenderEnded(eventData) {
    if (eventData.slotId === this.props.slotId) {
      this.props.onSlotRender(eventData);
    }
  },

  slotShouldRefresh() {
    let r = true;
    if (this.props.shouldRefresh !== undefined) {
      const {dfpNetworkId, adUnit, slotId, sizes} = this.props;
      r = this.props.shouldRefresh({dfpNetworkId, adUnit, slotId, sizes});
    }
    return r;
  },
});
