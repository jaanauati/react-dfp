import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import ReactTestUtils from 'react-dom/test-utils';
import { expect } from 'chai';
import sinon from 'sinon';

import { AdSlot, DFPManager } from '../lib';

describe('AdSlot', () => {
  describe('Component markup', () => {
    const compProps = {
      dfpNetworkId: '1000',
      adUnit: 'foo/bar/baz',
      sizes: [[728, 90], 'fluid'],
    };
    const compTwoProps = {
      ...compProps,
      slotId: 'testElement',
    };

    it('renders an AdSlot with the given elementId', () => {
      const component = ReactTestUtils.renderIntoDocument(<AdSlot {...compTwoProps} />);
      const box = ReactTestUtils.findRenderedDOMComponentWithClass(component, 'adBox');
      expect(box.id).to.equal('testElement');
    });

    it('renders two AdSlots and verify that those get different ids', () => {
      let componentOne = ReactTestUtils.renderIntoDocument(<AdSlot {...compProps} />);
      let componentTwo = ReactTestUtils.renderIntoDocument(<AdSlot {...compProps} />);
      componentOne = ReactTestUtils.findRenderedDOMComponentWithClass(componentOne, 'adBox');
      componentTwo = ReactTestUtils.findRenderedDOMComponentWithClass(componentTwo, 'adBox');
      expect(componentOne.id).to.not.equal(componentTwo.id);
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

      ReactTestUtils.renderIntoDocument(<AdSlot {...compProps} />);

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

      ReactTestUtils.renderIntoDocument(<AdSlot {...compProps} />);

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

      ReactTestUtils.renderIntoDocument(
        <AdSlot {...compProps} />,
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

      ReactTestUtils.renderIntoDocument(
        <AdSlot {...compProps} />,
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

      ReactTestUtils.renderIntoDocument(
        <AdSlot {...compProps} />,
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

      const component = ReactTestUtils.renderIntoDocument(
        <AdSlot {...compProps} />,
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
