import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import { AdSlot, DFPManager } from '../lib';

describe('AdSlot', () => {
  describe('Component markup', () => {
    let component;
    beforeEach(() => {
      component = TestUtils.renderIntoDocument(
        <AdSlot
          dfpNetworkId={1000}
          adUnit={'foo/bar/baz'}
          slotId={'testElement'}
          sizes={[[728, 90]]}
        />
      );
    });

    it('renders an adBox with the given elementId', () => {
      const box = TestUtils.findRenderedDOMComponentWithClass(component,
                                                              'adBox');
      expect(box.id).toEqual('testElement');
    });
  });

  describe('DFPManager Interaction', () => {
    beforeEach(() => {
      DFPManager.registerSlot = sinon.stub(DFPManager, 'registerSlot');
      DFPManager.unregisterSlot = sinon.stub(DFPManager, 'unregisterSlot');
    });

    it('Registers an AdSlot', () => {
      const compProps = {
        dfpNetworkId: 1000,
        adUnit: 'foo/bar/baz',
        slotId: 'testElement',
        sizes: [[728, 90]],
      };

      TestUtils.renderIntoDocument(
        <AdSlot { ...compProps} />
      );

      sinon.assert.calledOnce(DFPManager.registerSlot);
      sinon.assert.calledWithMatch(DFPManager.registerSlot, compProps);
    });

    it('Unregisters an AdSlot', () => {
      const compProps = {
        dfpNetworkId: 1000,
        adUnit: 'foo/bar/baz',
        slotId: 'testElement2',
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
    });
  });
});
