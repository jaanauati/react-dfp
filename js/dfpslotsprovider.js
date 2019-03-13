import React from 'react';
import PropTypes from 'prop-types';
import DFPManager from './manager';

export default class DFPSlotsProvider extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]).isRequired,
    autoLoad: PropTypes.bool,
    dfpNetworkId: PropTypes.string.isRequired,
    personalizedAds: PropTypes.bool,
    singleRequest: PropTypes.bool,
    adUnit: PropTypes.string,
    sizeMapping: PropTypes.arrayOf(PropTypes.object),
    adSenseAttributes: PropTypes.object,
    targetingArguments: PropTypes.object,
    collapseEmptyDivs: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object,
    ]),
    adSenseAttrs: PropTypes.object,
    lazyLoad: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        fetchMarginPercent: PropTypes.number,
        renderMarginPercent: PropTypes.number,
        mobileScaling: PropTypes.number,
      }),
    ]),
  };

  static childContextTypes = {
    dfpNetworkId: PropTypes.string,
    dfpAdUnit: PropTypes.string,
    dfpSizeMapping: PropTypes.arrayOf(PropTypes.object),
    dfpTargetingArguments: PropTypes.object,
    newSlotCallback: PropTypes.func,
  };

  static defaultProps = {
    autoLoad: true,
    personalizedAds: true,
    singleRequest: true,
    collapseEmptyDivs: null,
    lazyLoad: false,
  };

  constructor(props) {
    super(props);
    this.loadAdsIfPossible = this.loadAdsIfPossible.bind(this);
    this.newSlotCallback = this.newSlotCallback.bind(this);
    this.totalSlots = 0;
  }

  getChildContext() {
    return {
      dfpNetworkId: this.props.dfpNetworkId,
      dfpAdUnit: this.props.adUnit,
      dfpSizeMapping: this.props.sizeMapping,
      dfpTargetingArguments: this.props.targetingArguments,
      newSlotCallback: this.newSlotCallback,
    };
  }

  componentDidMount() {
    DFPManager.configurePersonalizedAds(this.props.personalizedAds);
    DFPManager.configureSingleRequest(this.props.singleRequest);
    DFPManager.configureLazyLoad(
      !!this.props.lazyLoad,
      typeof this.props.lazyLoad === 'boolean' ? null : this.props.lazyLoad,
    );
    DFPManager.setAdSenseAttributes(this.props.adSenseAttributes);
    DFPManager.setCollapseEmptyDivs(this.props.collapseEmptyDivs);
    if (this.props.autoLoad && !this.loadAdsIfPossible()) {
      DFPManager.on('slotRegistered', this.loadAdsIfPossible);
    }
  }

  // pretty strait-forward interface that children ads use to register
  // with their DFPSlotProvider parent node.
  newSlotCallback() {
    this.totalSlots++;
  }

  // Checks all the mounted children ads have been already registered
  // in the DFPManager before trying to call the gpt load scripts.
  // This is helpful when trying to fetch ads with a single request.
  loadAdsIfPossible() {
    let r = false;
    if (Object.keys(DFPManager.getRegisteredSlots()).length >= this.totalSlots) {
      DFPManager.removeListener('slotRegistered', this.loadAdsIfPossible);
      DFPManager.load();
      r = true;
    }
    return r;
  }

  render() {
    return <div> {this.props.children} </div>;
  }
}
