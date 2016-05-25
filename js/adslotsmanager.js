import React from 'react';
import { DFPManager } from './manager';

export const AdSlotsManager = React.createClass({
  displayName: 'AdSlotsManager',

  propTypes: {
    children: React.PropTypes.element.isRequired,
    dfpNetworkId: React.PropTypes.string.isRequired,
    adUnit: React.PropTypes.string,
    sizeMapping: React.PropTypes.arrayOf(React.PropTypes.object),
    fetchNow: React.PropTypes.bool,
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
      fetchNow: true,
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
    if (this.props.fetchNow) {
      DFPManager.load();
    }
  },

  render() {
    return <div> {this.props.children} </div>;
  },
});
