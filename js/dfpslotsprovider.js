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
    autoReload: PropTypes.shape({
      dfpNetworkId: PropTypes.bool,
      personalizedAds: PropTypes.bool,
      singleRequest: PropTypes.bool,
      adUnit: PropTypes.bool,
      sizeMapping: PropTypes.bool,
      adSenseAttributes: PropTypes.bool,
      targetingArguments: PropTypes.bool,
      collapseEmptyDivs: PropTypes.bool,
      lazyLoad: PropTypes.bool,
    }),
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
    autoReload: {
      dfpNetworkId: false,
      personalizedAds: false,
      singleRequest: false,
      adUnit: false,
      sizeMapping: false,
      adSenseAttributes: false,
      targetingArguments: false,
      collapseEmptyDivs: false,
      lazyLoad: false,
    },
    personalizedAds: true,
    singleRequest: true,
    collapseEmptyDivs: null,
    lazyLoad: false,
  };

  constructor(props) {
    super(props);
    this.loadAdsIfPossible = this.loadAdsIfPossible.bind(this);
    this.newSlotCallback = this.newSlotCallback.bind(this);
    this.applyConfigs = this.applyConfigs.bind(this);
    this.shouldReloadConfig = this.shouldReloadConfig.bind(this);
    this.loadAlreadyCalled = false;
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
    this.applyConfigs();
    if (this.props.autoLoad && !this.loadAdsIfPossible()) {
      DFPManager.on('slotRegistered', this.loadAdsIfPossible);
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.autoLoad && !this.props.autoLoad) {
      return true;
    }
    return this.shouldReloadConfig(nextProps);
  }

  componentDidUpdate() {
    this.applyConfigs();
    if (this.props.autoLoad) {
      if (this.loadAlreadyCalled) {
        if (this.props.autoReload) {
          DFPManager.reload();
        }
      } else if (!this.loadAdsIfPossible()) {
        DFPManager.on('slotRegistered', this.loadAdsIfPossible);
      }
    }
  }

  applyConfigs() {
    DFPManager.configurePersonalizedAds(this.props.personalizedAds);
    DFPManager.configureSingleRequest(this.props.singleRequest);
    DFPManager.configureLazyLoad(
      !!this.props.lazyLoad,
      typeof this.props.lazyLoad === 'boolean' ? null : this.props.lazyLoad,
    );
    DFPManager.setAdSenseAttributes(this.props.adSenseAttributes);
    DFPManager.setCollapseEmptyDivs(this.props.collapseEmptyDivs);
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
    this.loadAlreadyCalled = true;
    return r;
  }

  shouldReloadConfig(nextProps) {
    const reloadConfig = nextProps.autoReload || this.props.autoReload;
    if (this.props.autoLoad || nextProps.autoLoad) {
      if (typeof reloadConfig === 'object') {
        const attrs = Object.keys(reloadConfig);
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const i in attrs) {
          const propName = attrs[i];
          // eslint-disable-next-line
          if (reloadConfig[propName] === true && this.props[propName] !== nextProps[propName]) {
            return true;
          }
        }
      } else {
        return Boolean(reloadConfig);
      }
    }
    return false;
  }


  render() {
    return <div> {this.props.children} </div>;
  }
}
