import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';
import sinon from 'sinon';

import { AdSlot, DFPManager } from '../lib';

describe('AdSlot', () => {
  describe('Component markup', () => {
    const compProps = {
      dfpNetworkId: '1000',
      adUnit: 'foo/bar/baz',
      slotId: 'testElement',
      sizes: [[728, 90], 'fluid'],
    };

    let component;
    beforeEach(() => {
      component = TestUtils.renderIntoDocument(<AdSlot { ...compProps } />);
    });

    it('renders an adBox with the given elementId', () => {
      const box = TestUtils.findRenderedDOMComponentWithClass(component,
                                                              'adBox');
      expect(box.id).to.equal('testElement');
    });
  });

  describe('DFPManager Interaction', () => {
    beforeEach(() => {
      DFPManager.registerSlot = sinon.spy(DFPManager, 'registerSlot');
      DFPManager.unregisterSlot = sinon.spy(DFPManager, 'unregisterSlot');
    });

    it('Registers an AdSlot', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement1',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, compProps);
    });

    it('Registers a refreshable AdSlot', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement2',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );

      expect(DFPManager.getRefreshableSlots()).to.contain.all.keys([compProps.slotId]);
      expect(DFPManager.getRefreshableSlots()[compProps.slotId]).to.contain.all.keys(compProps);
    });

    it('Registers a non refreshable AdSlot', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement3',
        sizes: [[728, 90]],
        shouldRefresh: () => false,
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );
      expect(Object.keys(DFPManager.getRefreshableSlots()).length).to.equal(0);
    });

    it('Registers an AdSlot with custom targeting arguments', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement4',
        sizes: [[728, 90]],
        targetingArguments: { team: 'river plate', player: 'pisculichi' },
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );
      expect(DFPManager.getSlotTargetingArguments(compProps.slotId))
        .to.contain.all.keys(compProps.targetingArguments);
    });

    it('Registers an AdSlot without custom targeting arguments', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement5',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );
      expect(DFPManager.getSlotTargetingArguments(compProps.slotId)).to.equal(null);
    });


    it('Unregisters an AdSlot', () => {
      const compProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement6',
        sizes: [[728, 90]],
      };

      const component = TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );

      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(component).parentNode);

      sinon.assert.calledOnce(DFPManager.unregisterSlot);
      sinon.assert.calledWithMatch(DFPManager.unregisterSlot,
                                   { slotId: compProps.slotId });
    });

    afterEach(() => {
      DFPManager.registerSlot.restore();
      DFPManager.unregisterSlot.restore();
      Object.keys(DFPManager.getRegisteredSlots()).forEach((slotId) => {
        DFPManager.unregisterSlot({ slotId });
      });
    });
  });
});
