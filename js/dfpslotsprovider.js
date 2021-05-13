import React from 'react';
import PropTypes from 'prop-types';
import DFPManager from './manager';

// React.createContext is undefined for React < 16.3
export const Context = React.createContext ? React.createContext({
  dfpNetworkId: null,
  dfpAdUnit: null,
  dfpSizeMapping: null,
  dfpTargetingArguments: null,
  newSlotCallback: null,
}) : null;

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
      cookieOption: PropTypes.bool,
      singleRequest: PropTypes.bool,
      disableInitialLoad: PropTypes.bool,
      adUnit: PropTypes.bool,
      sizeMapping: PropTypes.bool,
      adSenseAttributes: PropTypes.bool,
      targetingArguments: PropTypes.bool,
      collapseEmptyDivs: PropTypes.bool,
      lazyLoad: PropTypes.bool,
    }),
    dfpNetworkId: PropTypes.string.isRequired,
    personalizedAds: PropTypes.bool,
    cookieOption: PropTypes.bool,
    singleRequest: PropTypes.bool,
    disableInitialLoad: PropTypes.bool,
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
    limitedAds: PropTypes.bool,
    deferAds: PropTypes.bool
  };

  static defaultProps = {
    autoLoad: true,
    autoReload: {
      dfpNetworkId: false,
      personalizedAds: false,
      cookieOption: false,
      singleRequest: false,
      disableInitialLoad: false,
      adUnit: false,
      sizeMapping: false,
      adSenseAttributes: false,
      targetingArguments: false,
      collapseEmptyDivs: false,
      lazyLoad: false,
    },
    personalizedAds: true,
    cookieOption: true,
    singleRequest: true,
    disableInitialLoad: false,
    collapseEmptyDivs: null,
    lazyLoad: false,
    limitedAds: false,
    deferAds: true
  };

  constructor(props) {
    super(props);
    this.loadAdsIfPossible = this.loadAdsIfPossible.bind(this);
    this.newSlotCallback = this.newSlotCallback.bind(this);
    this.applyConfigs = this.applyConfigs.bind(this);
    this.shouldReloadConfig = this.shouldReloadConfig.bind(this);
    this.attachLoadCallback = this.attachLoadCallback.bind(this);
    this.getContextValue = this.getContextValue.bind(this);
    this.loadAlreadyCalled = false;
    this.loadCallbackAttached = false;
    this.shouldReloadAds = false;
    this.totalSlots = 0;
    this.contextValue = {};
    if (Context === null) {
      this.getChildContext = () => this.getContextValue();
    }
  }

  componentDidMount() {
    this.applyConfigs();
    if (this.props.autoLoad && !this.loadAdsIfPossible()) {
      this.attachLoadCallback();
    }
  }

  shouldComponentUpdate(nextProps) {
    this.shouldReloadAds = this.shouldReloadConfig(nextProps);
    if (nextProps.children !== this.props.children) {
      return true;
    }
    if (nextProps.autoLoad && !this.props.autoLoad) {
      return true;
    }
    return this.shouldReloadAds;
  }

  componentDidUpdate() {
    this.applyConfigs();
    if (this.props.autoLoad) {
      if (this.loadAlreadyCalled) {
        if (this.shouldReloadAds) {
          DFPManager.reload();
        }
      } else if (!this.loadAdsIfPossible()) {
        this.attachLoadCallback();
      }
    }
    this.shouldReloadAds = false;
  }

  getContextValue() {
    const {
      props: {
        dfpNetworkId,
        adUnit: dfpAdUnit,
        sizeMapping: dfpSizeMapping,
        targetingArguments: dfpTargetingArguments,
      },
      contextValue: {
        dfpNetworkId: ctxDfpNetworkId,
        adUnit: ctxDfpAdUnit,
        sizeMapping: ctxDfpSizeMapping,
        targetingArguments: ctxDfpTargetingArguments,
      },
    } = this;
    // performance: update context value object only when any of its
    // props is updated.
    if (
      dfpNetworkId !== ctxDfpNetworkId ||
      dfpAdUnit !== ctxDfpAdUnit ||
      dfpSizeMapping !== ctxDfpSizeMapping ||
      dfpTargetingArguments !== ctxDfpTargetingArguments
    ) {
      this.contextValue = {
        dfpNetworkId,
        dfpAdUnit,
        dfpSizeMapping,
        dfpTargetingArguments,
        newSlotCallback: this.newSlotCallback,
      };
    }
    return this.contextValue;
  }

  applyConfigs() {
    DFPManager.configurePersonalizedAds(this.props.personalizedAds);
    DFPManager.configureCookieOption(this.props.cookieOption);
    DFPManager.configureSingleRequest(this.props.singleRequest);
    DFPManager.configureDisableInitialLoad(this.props.disableInitialLoad);
    DFPManager.configureLazyLoad(
      !!this.props.lazyLoad,
      typeof this.props.lazyLoad === 'boolean' ? null : this.props.lazyLoad,
    );
    DFPManager.setAdSenseAttributes(this.props.adSenseAttributes);
    DFPManager.setCollapseEmptyDivs(this.props.collapseEmptyDivs);
    DFPManager.configureLimitedAds(this.props.limitedAds);
    DFPManager.configureDeferAds(this.props.deferAds);
  }

  attachLoadCallback() {
    if (this.loadCallbackAttached === false) {
      DFPManager.on('slotRegistered', this.loadAdsIfPossible);
      this.loadCallbackAttached = true;
      return true;
    }
    return false;
  }

  // pretty strait-forward interface that children ad slots use to register
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
      this.loadAlreadyCalled = true;
      this.loadCallbackAttached = false;
      r = true;
    }
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
      }
    }
    return false;
  }

  render() {
    const { children } = this.props;
    if (Context === null) {
      return children;
    }
    return (
      <Context.Provider value={this.getContextValue()}>
        {children}
      </Context.Provider>
    );
  }
}

if (Context === null) {
  // React < 16.3
  DFPSlotsProvider.childContextTypes = {
    dfpNetworkId: PropTypes.string,
    dfpAdUnit: PropTypes.string,
    dfpSizeMapping: PropTypes.arrayOf(PropTypes.object),
    dfpTargetingArguments: PropTypes.object,
    newSlotCallback: PropTypes.func,
  };
}
