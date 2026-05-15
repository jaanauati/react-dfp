import * as React from 'react';

type AdSizeItem = number[] | string;

type SizeMappingEntry = {
  viewport: [number, number];
  sizes: AdSizeItem[];
};

/**
 * Ad slot props (see adslot.jsx JSDoc). Ad unit / sizes / sizeMapping are
 * often supplied by DFPSlotsProvider context instead of props.
 */
export type AdSlotProps = {
  dfpNetworkId?: string;
  adUnit?: string;
  sizes?: AdSizeItem[];
  renderOutOfThePage?: boolean;
  sizeMapping?: SizeMappingEntry[];
  className?: string;
  fetchNow?: boolean;
  adSenseAttributes?: Record<string, string>;
  targetingArguments?: Record<string, string | string[] | null | undefined>;
  onSlotRender?: (params: {
    slotId: string;
    event: unknown;
    adElementRef: React.LegacyRef<HTMLDivElement>;
  }) => void;
  onSlotRegister?: (params: {
    slotId: string;
    sizes?: AdSizeItem[];
    slotCount: number;
    adElementRef: React.LegacyRef<HTMLDivElement>;
  }) => void;
  onSlotIsViewable?: (params: { slotId: string; event: unknown }) => void;
  onSlotVisibilityChanged?: (params: {
    slotId: string;
    event: unknown;
  }) => void;
  shouldRefresh?: (ctx: { slotId: string; [key: string]: unknown }) => boolean;
  slotId?: string;
};

export function AdSlot(props: AdSlotProps): React.ReactElement;

/**
 * @see dfpslotsprovider.jsx AutoReloadConfig
 */
export type AutoReloadConfig = {
  dfpNetworkId?: boolean;
  personalizedAds?: boolean;
  cookieOption?: boolean;
  singleRequest?: boolean;
  disableInitialLoad?: boolean;
  adUnit?: boolean;
  sizeMapping?: boolean;
  adSenseAttributes?: boolean;
  targetingArguments?: boolean;
  collapseEmptyDivs?: boolean;
  lazyLoad?: boolean;
};

export type LazyLoadConfig = {
  fetchMarginPercent?: number;
  renderMarginPercent?: number;
  mobileScaling?: number;
};

/**
 * @see dfpslotsprovider.jsx DFPSlotsProviderProps
 */
export type DFPSlotsProviderProps = {
  children: React.ReactNode;
  autoLoad?: boolean;
  dfpNetworkId: string;
  adUnit?: string;
  sizeMapping?: SizeMappingEntry[];
  targetingArguments?: Record<string, string | string[] | null | undefined>;
  adSenseAttributes?: Record<string, string>;
  /**
   * Listed in the provider’s typedef but not read by the implementation (only
   * {@link adSenseAttributes} is used).
   */
  adSenseAttrs?: Record<string, string>;
  autoReload?: AutoReloadConfig;
  personalizedAds?: boolean;
  cookieOption?: boolean;
  singleRequest?: boolean;
  disableInitialLoad?: boolean;
  collapseEmptyDivs?: boolean | null;
  lazyLoad?: boolean | LazyLoadConfig;
  limitedAds?: boolean;
};

export function DFPSlotsProvider(
  props: DFPSlotsProviderProps,
): React.ReactElement;

export type RegisteredAdSlot = {
  slotId: string;
  sizes?: AdSizeItem[];
  renderOutOfThePage?: boolean;
  dfpNetworkId?: string;
  adUnit?: string;
  adSenseAttributes?: Record<string, string | undefined>;
  targetingArguments?: Record<string, string | string[] | null | undefined>;
  sizeMapping?: SizeMappingEntry[];
  slotShouldRefresh?: () => boolean;
  loading: boolean;
  gptSlot?: unknown;
};

/**
 * DFPManager singleton with GPT helpers (see manager.js object).
 */
export interface DFPManager {
  singleRequestIsEnabled(): boolean;
  configureSingleRequest(value: boolean): void;
  disableInitialLoadIsEnabled(): boolean;
  configureDisableInitialLoad(value: boolean): void;
  configureLazyLoad(
    enable?: boolean,
    config?: LazyLoadConfig | null,
  ): void;
  lazyLoadIsEnabled(): boolean;
  limitedAdsIsEnabled(): boolean;
  configureLimitedAds(value: boolean): void;
  getLazyLoadConfig(): LazyLoadConfig | null;
  getAdSenseAttribute(key: string): string | undefined;
  setAdSenseAttribute(key: string, value: string): void;
  getAdSenseAttributes(): Record<string, string>;
  setAdSenseAttributes(
    attrs: Record<string, string> | undefined,
  ): void;
  configurePersonalizedAds(value: boolean): void;
  configureCookieOption(value: boolean): void;
  personalizedAdsEnabled(): boolean;
  cookiesEnabled(): boolean;
  setTargetingArguments(
    data: Record<string, string | string[] | null | undefined>,
  ): void;
  getTargetingArguments(): Record<
    string,
    string | string[] | null | undefined
  >;
  getSlotProperty(slotId: string, propName: string): unknown;
  getSlotTargetingArguments(
    slotId: string,
  ): Record<string, string | string[] | null | undefined> | null;
  getSlotAdSenseAttributes(
    slotId: string,
  ): Record<string, string> | null;
  init(): void;
  getGoogletag(): Promise<unknown>;
  setCollapseEmptyDivs(collapse: boolean | null): void;
  load(...slotIds: string[]): void;
  doLoad(...slotIds: string[]): Promise<void>;
  gptLoadAds(slotsToInitialize: string[]): Promise<void>;
  configureInitialOptions(googletag: unknown): void;
  configureOptions(googletag: unknown): void;
  getRefreshableSlots(
    ...slotIds: string[],
  ): Record<string, RegisteredAdSlot>;
  refresh(...slotIds: string[]): void;
  gptRefreshAds(slotIds: string[]): Promise<void>;
  reload(...slotIds: string[]): Promise<void>;
  destroyGPTSlots(...slotIds: string[]): Promise<string[]>;
  registerSlot(
    slot: {
      slotId: string;
      dfpNetworkId?: string;
      adUnit?: string;
      sizes?: AdSizeItem[];
      renderOutOfThePage?: boolean;
      sizeMapping?: SizeMappingEntry[];
      adSenseAttributes?: Record<string, string | undefined>;
      targetingArguments?: Record<string, string | string[] | null | undefined>;
      slotShouldRefresh?: () => boolean;
    },
    autoLoad?: boolean,
  ): void;
  unregisterSlot(opts: { slotId: string }): void;
  getRegisteredSlots(): Record<string, RegisteredAdSlot>;
  attachSlotRenderEnded(cb: (data: { slotId: string; event: unknown }) => void): void;
  detachSlotRenderEnded(cb: (data: { slotId: string; event: unknown }) => void): void;
  attachSlotVisibilityChanged(
    cb: (data: { slotId: string; event: unknown }) => void,
  ): void;
  detachSlotVisibilityChanged(
    cb: (data: { slotId: string; event: unknown }) => void,
  ): void;
  attachSlotIsViewable(
    cb: (data: { slotId: string; event: unknown }) => void,
  ): void;
  detachSlotIsViewable(
    cb: (data: { slotId: string; event: unknown }) => void,
  ): void;
}

export declare const DFPManager: DFPManager;
