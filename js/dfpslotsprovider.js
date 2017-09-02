import React from 'react';
import PropTypes from 'prop-types';
import DFPManager from './manager';

export default class DFPSlotsProvider extends React.Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
    autoLoad: PropTypes.bool,
    dfpNetworkId: PropTypes.string.isRequired,
    adUnit: PropTypes.string,
    sizeMapping: PropTypes.arrayOf(PropTypes.object),
    targetingArguments: PropTypes.object,
    collapseEmptyDivs: PropTypes.bool,
  };

  static childContextTypes = {
    dfpNetworkId: PropTypes.string,
    dfpAdUnit: PropTypes.string,
    dfpSizeMapping: PropTypes.arrayOf(PropTypes.object),
    dfpTargetingArguments: PropTypes.object,
  };

  static defaultProps = {
    autoLoad: true,
    collapseEmptyDivs: true,
  };

  getChildContext() {
    return {
      dfpNetworkId: this.props.dfpNetworkId,
      dfpAdUnit: this.props.adUnit,
      dfpSizeMapping: this.props.sizeMapping,
      dfpTargetingArguments: this.props.targetingArguments,
    };
  }

  componentDidMount() {
    if (this.props.autoLoad) {
      DFPManager.load();
    }
  }

  render() {
    return <div > {this.props.children} </div>;
  }
}
