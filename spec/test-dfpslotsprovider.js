import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { expect } from 'chai';
import sinon from 'sinon';

import { DFPSlotsProvider, AdSlot, DFPManager } from '../lib';

describe('DFPSlotsProvider', () => {
  describe('GDPR', () => {
    beforeAll(() => {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
      DFPManager.load = sinon.spy(DFPManager, 'load');
    });

    it('Fetches personalized ads by default', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...otherProps}>
          <AdSlot slotId={'testElement'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.personalizedAdsEnabled()).to.equal(true);
    });

    it('Can disable personalized ads', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider personalizedAds={false} {...otherProps}>
          <AdSlot slotId={'testElement1'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.personalizedAdsEnabled()).to.equal(false);
    });

    it('Can enable personalized ads', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider personalizedAds {...otherProps}>
          <AdSlot slotId={'testElement2'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.personalizedAdsEnabled()).to.equal(true);
    });

    afterAll(() => {
      DFPManager.gptLoadAds.restore();
      DFPManager.load.restore();
    });
  });

  describe('Lazy Load', () => {
    beforeAll(() => {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
      DFPManager.load = sinon.spy(DFPManager, 'load');
    });

    it('Lazy load disabled by default', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...otherProps}>
          <AdSlot slotId={'testElement'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.lazyLoadIsEnabled()).to.equal(false);
      expect(DFPManager.getLazyLoadConfig()).to.equal(null);
    });

    it('Can enable lazy load', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider lazyLoad {...otherProps}>
          <AdSlot slotId={'testElement1'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.lazyLoadIsEnabled()).to.equal(true);
      expect(DFPManager.getLazyLoadConfig()).to.equal(null);
    });

    it('Can pass arbitrary configs', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      const lazyLoadConfig = {
        fetchMarginPercent: 1,
        renderMarginPercent: 1,
        mobileScaling: 1,
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider lazyLoad={lazyLoadConfig}  {...otherProps}>
          <AdSlot slotId={'testElement1'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.lazyLoadIsEnabled()).to.equal(true);
      expect(DFPManager.getLazyLoadConfig()).to.deep.equal(lazyLoadConfig);
    });

    it('Can disable lazyLoad', () => {
      const otherProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        lazyLoad: false,
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider personalizedAds {...otherProps}>
          <AdSlot slotId={'testElement2'} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.lazyLoadIsEnabled()).to.equal(false);
      expect(DFPManager.getLazyLoadConfig()).to.equal(null);
    });

    afterAll(() => {
      DFPManager.gptLoadAds.restore();
      DFPManager.load.restore();
    });
  });

  describe('Component markup', () => {
    let component;

    beforeAll(() => {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
      DFPManager.load = sinon.spy(DFPManager, 'load');
    });

    beforeEach(() => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      component = TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot slotId={'testElement3'} />
        </DFPSlotsProvider>,
      );
    });

    it('renders an adBox with the given elementId', () => {
      const box = TestUtils.findRenderedDOMComponentWithClass(component, 'adBox');
      expect(box.id).to.equal('testElement3');
    });

    afterAll(() => {
      DFPManager.gptLoadAds.restore();
      DFPManager.load.restore();
    });
  });

  describe('DFPManager Interaction', () => {
    beforeAll(() => {
      DFPManager.gptLoadAds = sinon.stub(
        DFPManager,
        'gptLoadAds',
      ).resolves(true);
    });

    beforeEach(() => {
      DFPManager.registerSlot = sinon.spy(DFPManager, 'registerSlot');
      DFPManager.unregisterSlot = sinon.spy(DFPManager, 'unregisterSlot');
      DFPManager.setCollapseEmptyDivs = sinon.spy(DFPManager, 'setCollapseEmptyDivs');
      DFPManager.load = sinon.spy(DFPManager, 'load');
      DFPManager.refresh = sinon.spy(DFPManager, 'refresh');
    });

    it('Registers an AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement5',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, { ...providerProps, ...compProps });
      sinon.assert.calledOnce(DFPManager.load);
      sinon.assert.notCalled(DFPManager.refresh);
    });

    it('Auto-refreshes ads when updating DFPSlotsProvider props', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement5',
        sizes: [[728, 90]],
      };


      const container = document.createElement('div');
      ReactDOM.render(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
        container,
      );

      ReactDOM.render(
        <DFPSlotsProvider {...providerProps} personalizedAds={false}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
        container,
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, { ...providerProps, ...compProps });
      sinon.assert.calledOnce(DFPManager.load);
      sinon.assert.calledOnce(DFPManager.refresh);
    });

    it('Can dissable auto-refresh', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement5',
        sizes: [[728, 90]],
      };


      const container = document.createElement('div');
      ReactDOM.render(
        <DFPSlotsProvider {...providerProps} autoRefreshOnPropsUpdate={false}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
        container,
      );

      ReactDOM.render(
        <DFPSlotsProvider
          {...providerProps} 
          autoRefreshOnPropsUpdate={false}
          personalizedAds={false}
        >
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
        container,
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, { ...providerProps, ...compProps });
      sinon.assert.calledOnce(DFPManager.load);
      sinon.assert.notCalled(DFPManager.refresh);
    });
    it('Gets singleRequest enabled by default', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement6',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      expect(DFPManager.singleRequestIsEnabled()).equal(true);
    });

    it('Can disable singleRequest', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        singleRequest: false,
      };

      const compProps = {
        slotId: 'testElement7',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      expect(DFPManager.singleRequestIsEnabled()).equal(false);
    });

    it('Can enable singleRequest', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        singleRequest: true,
      };

      const compProps = {
        slotId: 'testElement8',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      expect(DFPManager.singleRequestIsEnabled()).equal(true);
    });

    it('Disables singleRequest', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        singleRequest: false,
      };

      const compProps = {
        slotId: 'testElement9',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      expect(DFPManager.singleRequestIsEnabled()).equal(false);
    });

    it('Registers a refreshable AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement10',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      expect(DFPManager.getRefreshableSlots()).to.contain.all.keys([compProps.slotId]);
      expect(DFPManager.getRefreshableSlots()[compProps.slotId]).to.contain.all.keys(
        { ...providerProps, ...compProps },
      );
    });

    it('Registers a non refreshable AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement11',
        sizes: [[728, 90]],
        shouldRefresh: () => false,
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps} >
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );
      expect(Object.keys(DFPManager.getRefreshableSlots()).length).to.equal(0);
    });

    it('Registers global adSense attributes', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        adSenseAttributes: {
          site_url: 'www.mysite.com',
          adsense_border_color: '#0000FF',
        },
      };
      const compProps = {
        slotId: 'testElement12',
        sizes: [[728, 90]],
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps} >
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.getAdSenseAttributes())
        .to.deep.equal(providerProps.adSenseAttributes);
      expect(DFPManager.getSlotAdSenseAttributes(compProps.slotId))
        .to.deep.equal(null);
    });

    it('Registers an AdSlot with adSense attributes', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        adSenseAttributes: {
          site_url: 'www.mysite.com',
          adsense_border_color: '#0000FF',
        },
      };
      const compProps = {
        slotId: 'testElement13',
        sizes: [[728, 90]],
        adSenseAttributes: {
          site_url: 'www.mysite.com',
          adsense_border_color: '#000000',
          adsense_channel_ids: '271828183+314159265',
        },
      };
      const comp2Props = {
        slotId: 'testElement14',
        sizes: [[728, 90]],
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps} >
          <AdSlot {...compProps} />
          <AdSlot {...comp2Props} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.getAdSenseAttributes())
        .to.deep.equal(providerProps.adSenseAttributes);
      expect(DFPManager.getSlotAdSenseAttributes(compProps.slotId))
        .to.deep.equal(compProps.adSenseAttributes);
      expect(DFPManager.getSlotAdSenseAttributes(comp2Props.slotId))
        .to.deep.equal(null);
    });

    it('Registers an AdSlot with custom targeting arguments', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        targetingArguments: { team: 'river plate', player: 'pisculichi' },
      };
      const compProps = {
        slotId: 'testElement15',
        sizes: [[728, 90]],
      };
      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps} >
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.getSlotTargetingArguments(compProps.slotId))
        .to.contain.all.keys(providerProps.targetingArguments);
    });

    it('Registers an AdSlot without custom targeting arguments', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      const compProps = {
        slotId: 'testElement16',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps} >
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );
      expect(DFPManager.getSlotTargetingArguments(compProps.slotId)).to.equal(null);
    });


    it('Unregisters an AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };
      const compProps = {
        slotId: 'testElement17',
        sizes: [[728, 90]],
      };


      const component = TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      // eslint-disable-next-line react/no-find-dom-node
      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(component).parentNode);

      sinon.assert.calledOnce(DFPManager.unregisterSlot);
      sinon.assert.calledWithMatch(
        DFPManager.unregisterSlot,
        { slotId: compProps.slotId },
      );
    });

    it('collapseEmptyDivs is disabled by default', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement18',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      sinon.assert.calledOnce(DFPManager.setCollapseEmptyDivs);
      sinon.assert.calledWith(DFPManager.setCollapseEmptyDivs, null);
    });

    it('enable collapseEmptyDivs and set parameter to false', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        collapseEmptyDivs: false,
      };

      const compProps = {
        slotId: 'testElement19',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      sinon.assert.calledOnce(DFPManager.setCollapseEmptyDivs);
      sinon.assert.calledWith(DFPManager.setCollapseEmptyDivs, false);
    });

    afterEach(() => {
      DFPManager.registerSlot.restore();
      DFPManager.unregisterSlot.restore();
      DFPManager.setCollapseEmptyDivs.restore();
      Object.keys(DFPManager.getRegisteredSlots()).forEach((slotId) => {
        DFPManager.unregisterSlot({ slotId });
      });
      DFPManager.load.restore();
      DFPManager.refresh.restore();
    });

    afterAll(() => {
      DFPManager.gptLoadAds.restore();
    });
  });
});
