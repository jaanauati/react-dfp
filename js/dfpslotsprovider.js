import React from 'react';
import { DFPManager } from './manager';

export const DFPSlotsProvider = React.createClass({
  displayName: 'DFPSlotsProvider',

  propTypes: {
    children: React.PropTypes.element.isRequired,
    autoLoad: React.PropTypes.bool,
    dfpNetworkId: React.PropTypes.string.isRequired,
    adUnit: React.PropTypes.string,
    sizeMapping: React.PropTypes.arrayOf(React.PropTypes.object),
    targetingArguments: React.PropTypes.object,
  },

  childContextTypes: {
    dfpNetworkId: React.PropTypes.string,
    dfpAdUnit: React.PropTypes.string,
    dfpSizeMapping: React.PropTypes.arrayOf(React.PropTypes.object),
    dfpTargetingArguments: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      autoLoad: true,
    };
  },

  getChildContext() {
    return {
      dfpNetworkId: this.props.dfpNetworkId,
      dfpAdUnit: this.props.adUnit,
      dfpSizeMapping: this.props.sizeMapping,
      dfpTargetingArguments: this.props.targetingArguments,
    };
  },

  componentDidMount() {
    if (this.props.autoLoad) {
      DFPManager.load();
    }
  },

  render() {
    return <div> {this.props.children} </div>;
  },
});
