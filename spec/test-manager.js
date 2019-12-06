import { expect } from 'chai';
import sinon from 'sinon';
import { DFPManager } from '../lib';

describe('DFPManager', () => {
  describe('GDPR', () => {
    it('Fetches personalized ads by default', function registersAdSlot() {
      expect(DFPManager.personalizedAdsEnabled()).equal(true);
    });
    it('Can disable personalized ads', function registersAdSlot() {
      DFPManager.configurePersonalizedAds(false);
      expect(DFPManager.personalizedAdsEnabled()).equal(false);
    });
    it('Can enable personalized ads', function registersAdSlot() {
      DFPManager.configurePersonalizedAds(true);
      expect(DFPManager.personalizedAdsEnabled()).equal(true);
    });
  });

  describe('Lazy Loading', () => {
    it('Lazy load is disabled by default', function registersAdSlot() {
      expect(DFPManager.lazyLoadIsEnabled()).equal(false);
      expect(DFPManager.getLazyLoadConfig()).equal(null);
    });
    it('Can enable lazy load', function canEnableLazyLoad() {
      DFPManager.configureLazyLoad(true);
      expect(DFPManager.lazyLoadIsEnabled()).equal(true);
    });
    it('There isnt custom config by default', function noConfigByDefault() {
      DFPManager.configureLazyLoad(true);
      expect(DFPManager.getLazyLoadConfig()).equal(null);
    });
    it('Can pass any arbitrary config', function noConfigByDefault() {
      DFPManager.configureLazyLoad(true, { renderMarginPercent: 1 });
      expect(DFPManager.getLazyLoadConfig()).to.deep.equal({
        renderMarginPercent: 1,
      });
    });
    it('Can disable lazy load', function canDisableLazyLoad() {
      DFPManager.configureLazyLoad(false);
      expect(DFPManager.lazyLoadIsEnabled()).equal(false);
    });
  });

  describe('Single Request', () => {
    it('Gets singleRequest enabled by default', function registersAdSlot() {
      expect(DFPManager.singleRequestIsEnabled()).equal(true);
    });
    it('Can disable singleRequest', function registersAdSlot() {
      DFPManager.configureSingleRequest(false);
      expect(DFPManager.singleRequestIsEnabled()).equal(false);
    });
    it('Can enable singleRequest', function registersAdSlot() {
      DFPManager.configureSingleRequest(true);
      expect(DFPManager.singleRequestIsEnabled()).equal(true);
    });
  });

  describe('Disable Initial Load', () => {
    it('disableInitiaLoad disabled by default', function testDisableInitialLoad1() {
      expect(DFPManager.disableInitialLoadIsEnabled()).equal(false);
    });
    it('Can enable disableInitialLoad', function testDisableInitialLoad2() {
      DFPManager.configureDisableInitialLoad(true);
      expect(DFPManager.disableInitialLoadIsEnabled()).equal(true);
    });
    it('Can disable disableInitialLoad', function testDisableInitialLoad3() {
      DFPManager.configureDisableInitialLoad(false);
      expect(DFPManager.disableInitialLoadIsEnabled()).equal(false);
    });
  });

  describe('AdSense attributes', () => {
    beforeEach(function beforeEach() {
      this.argsList1 = {
        page_url: 'www.mysite.com',
        adsense_url_color: '#000000',
      };
      this.argsList2 = { adsense_ad_format: '250x250_as' };
      DFPManager.setAdSenseAttributes(this.argsList1);
      DFPManager.setAdSenseAttribute('adsense_ad_format', '250x250_as');
    });

    it('Properly tracks global AdSense attributes', function registersAdSlot() {
      expect(DFPManager.getAdSenseAttributes()).to.contain.keys(
        { ...this.argsList1, ...this.argsList2 },
      );
    });
  });

  describe('Targeting arguments', () => {
    beforeEach(function beforeEach() {
      this.argsList1 = { k: 'yeah' };
      this.argsList2 = { k: 'yeah' };
      DFPManager.setTargetingArguments(this.argsList1);
      DFPManager.setTargetingArguments(this.argsList2);
    });

    it('Registers global targeting arguments', function registersAdSlot() {
      expect(DFPManager.getTargetingArguments()).to.contain.keys(
        { ...this.argsList1, ...this.argsList2 },
      );
    });
  });

  describe('Creation of ad slots ', () => {
    beforeAll(function before() {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
      DFPManager.gptRefreshAds = sinon.stub(
        DFPManager,
        'gptRefreshAds',
      ).resolves(true);
      DFPManager.destroyGPTSlots = sinon.stub(
        DFPManager,
        'destroyGPTSlots',
      ).resolves(true);
      this.slotProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        sizes: [[728, 90]],
        adSenseAttributes: {
          site_url: 'www.mysite.com',
          adsense_border_color: '#000000',
        },
        slotShouldRefresh: () => true,
      };
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement1' });
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement2' });
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement3' });
      DFPManager.load();
      DFPManager.refresh();
    });

    it('Registers ad slots', function registersAdSlot() {
      expect(Object.keys(DFPManager.getRegisteredSlots()).length).to.equal(3);
      expect(DFPManager.getRegisteredSlots()).to.contain.all
        .keys(['testElement1', 'testElement2', 'testElement3']);
      expect(DFPManager.getRegisteredSlots().testElement1)
        .to.contain.all.keys({ ...this.slotProps, slotId: 'testElement1' });
      expect(DFPManager.getRegisteredSlots().testElement2)
        .to.contain.all.keys({ ...this.slotProps, slotId: 'testElement2' });
      expect(DFPManager.getRegisteredSlots().testElement3)
        .to.contain.all.keys({ ...this.slotProps, slotId: 'testElement3' });
      expect(DFPManager.getRegisteredSlots().testElement1)
        .to.deep.include({ ...this.slotProps, slotId: 'testElement1' });
      expect(DFPManager.getRegisteredSlots().testElement2)
        .to.deep.include({ ...this.slotProps, slotId: 'testElement2' });
      expect(DFPManager.getRegisteredSlots().testElement3)
        .to.deep.include({ ...this.slotProps, slotId: 'testElement3' });
    });

    it('Loads all the ads by default', function adsLoaded() {
      sinon.assert.calledOnce(DFPManager.gptLoadAds);
      sinon.assert.calledWith(
        DFPManager.gptLoadAds,
        ['testElement1', 'testElement2', 'testElement3'],
      );
    });

    it('Refreshes all the ads by default', function adsLoaded() {
      sinon.assert.calledOnce(DFPManager.gptRefreshAds);
      sinon.assert.calledWith(
        DFPManager.gptRefreshAds,
        ['testElement1', 'testElement2', 'testElement3'],
      );
    });

    afterAll(function afterEach() {
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement1' });
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement2' });
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement3' });
      DFPManager.gptLoadAds.restore();
      DFPManager.gptRefreshAds.restore();
      DFPManager.destroyGPTSlots.restore();
    });
  });

  describe('Initalization of arbitrary slots ', () => {
    beforeAll(function before() {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
      DFPManager.gptRefreshAds = sinon.stub(
        DFPManager,
        'gptRefreshAds',
      ).resolves(true);
      DFPManager.destroyGPTSlots = sinon.stub(
        DFPManager,
        'destroyGPTSlots',
      ).resolves(true);
      this.slotProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        sizes: [[728, 90]],
        adSenseAttributes: {
          site_url: 'www.mysite.com',
          adsense_border_color: '#000000',
        },
        slotShouldRefresh: () => true,
      };
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement4' }, false);
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement5' }, false);
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement6' }, false);
      DFPManager.registerSlot({ ...this.slotProps, slotId: 'testElement7' }, false);
      DFPManager.load('testElement4', 'testElement6', 'testElement7');
      DFPManager.refresh('testElement4', 'testElement7');
    });

    it('Loads arbitrary ads', function adsLoaded() {
      sinon.assert.calledOnce(DFPManager.gptLoadAds);
      sinon.assert.calledWith(
        DFPManager.gptLoadAds,
        ['testElement4', 'testElement6', 'testElement7'],
      );
    });

    it('Refreshes arbitrary ads', function adsLoaded() {
      sinon.assert.calledOnce(DFPManager.gptRefreshAds);
      sinon.assert.calledWith(
        DFPManager.gptRefreshAds, ['testElement4', 'testElement7'],
      );
    });

    afterAll(function afterEach() {
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement4' });
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement5' });
      DFPManager.unregisterSlot({ ...this.slotProps, slotId: 'testElement6' });
      DFPManager.gptLoadAds.restore();
      DFPManager.gptRefreshAds.restore();
      DFPManager.destroyGPTSlots.restore();
    });
  });
});
