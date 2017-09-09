import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import TestUtils from 'react-dom/test-utils';
import { expect } from 'chai';
import sinon from 'sinon';

import { DFPSlotsProvider, AdSlot, DFPManager } from '../lib';

describe('DFPSlotsProvider', () => {
  describe('Component markup', () => {
    let component;
    beforeEach(() => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      component = TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot slotId={'testElement'} />
        </DFPSlotsProvider>,
      );
    });

    it('renders an adBox with the given elementId', () => {
      const box = TestUtils.findRenderedDOMComponentWithClass(component, 'adBox');
      expect(box.id).to.equal('testElement');
    });
  });

  describe('DFPManager Interaction', () => {
    beforeEach(() => {
      DFPManager.registerSlot = sinon.spy(DFPManager, 'registerSlot');
      DFPManager.unregisterSlot = sinon.spy(DFPManager, 'unregisterSlot');
      DFPManager.setCollapseEmptyDivs = sinon.spy(DFPManager, 'setCollapseEmptyDivs');
    });

    it('Registers an AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement1',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <DFPSlotsProvider {...providerProps}>
          <AdSlot {...compProps} />
        </DFPSlotsProvider>,
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, { ...providerProps, ...compProps });
    });

    it('Registers a refreshable AdSlot', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement2',
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
        slotId: 'testElement3',
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

    it('Registers an AdSlot with custom targeting arguments', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        targetingArguments: { team: 'river plate', player: 'pisculichi' },
      };
      const compProps = {
        slotId: 'testElement4',
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
        slotId: 'testElement5',
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
        slotId: 'testElement6',
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
      sinon.assert.calledWithMatch(DFPManager.unregisterSlot,
                                   { slotId: compProps.slotId });
    });

    it('collapseEmptyDivs is disabled by default', () => {
      const providerProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
      };

      const compProps = {
        slotId: 'testElement1',
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
        slotId: 'testElement1',
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
    });
  });
});
