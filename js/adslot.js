
import React from 'react';
import {DFPManager} from './manager';


export const AdSlot = React.createClass({
  displayName: 'AdSlot',

  propTypes: {
    dfpNetworkId: React.PropTypes.string.isRequired,
    adUnit: React.PropTypes.string.isRequired,
    sizes: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    renderOutOfThePage: React.PropTypes.bool,
    sizeMapping: React.PropTypes.arrayOf(React.PropTypes.object),
    fetchNow: React.PropTypes.bool,
    targetingArguments: React.PropTypes.object,
    onSlotRender: React.PropTypes.func,
    shouldRefresh: React.PropTypes.func,
    slotId: React.PropTypes.string,
  },
  
  
  getDefaultProps() {
    return {
      fetchNow: false,
    };
  },
  
  generateSlotId() {
    let slotId = this.props.slotId;
    if (slotId === undefined) {
      let seconds = (Date.now && Date.now() || new Date().getTime()) / 1000;  
      slotId = `adSlot-${seconds}`;
    }
    return slotId
  },
  
  getSlotId() {
    return this.props.slotId || this.state.slotId;
  },

  registerSlot() {
    DFPManager.registerSlot({ ...this.props, ...this.state, slotShouldRefresh: this.slotShouldRefresh });
    if (this.props.fetchNow === true) {
      DFPManager.load(this.getSlotId());
    }
    DFPManager.attachSlotRenderEnded(this.slotRenderEnded);
  },
  
  unregisterSlot() {
    DFPManager.unregisterSlot({ ...this.props, ...this.state });
    DFPManager.detachSlotRenderEnded(this.slotRenderEnded);
  },

  getInitialState() {
    return { ...this.props, slotId: this.generateSlotId() };
  },
  
  componentDidMount() {
    this.registerSlot();
  },

  render() {
    return (
      <div className="adunitContainer"> <div id={this.getSlotId()} className="adBox" /> </div>
    );
  },

  componentWillUnmount() {
    this.unregisterSlot();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.hasOwnProperty('objectId')) {
      let state = this.state;
      state.slotId = this.generateSlotId();
      this.unregisterSlot();
      this.setState(state);
      this.registerSlot();
    }
  },

  slotRenderEnded(eventData) {
    if (eventData.slotId === this.getSlotId()) {
      if (this.props.onSlotRender !== undefined) { 
        this.props.onSlotRender(eventData);
      }
    }
  },

  slotShouldRefresh() {
    let r = true;
    if (this.props.shouldRefresh !== undefined) {
      r = this.props.shouldRefresh({...this.props, slotId: this.getSlotId()});
    }
    return r;
  },
});
