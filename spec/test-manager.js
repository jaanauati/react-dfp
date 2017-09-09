import { expect } from 'chai';
import { DFPManager } from '../lib';

describe('DFPManager', () => {
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
    beforeEach(function beforeEach() {
      this.slotProps = {
        dfpNetworkId: '1000',
        adUnit: 'foo/bar/baz',
        slotId: 'testElement',
        sizes: [[728, 90]],
        slotShouldRefresh: () => true,
      };
      DFPManager.registerSlot(this.slotProps);
    });

    it('Registers an adslot', function registersAdSlot() {
      expect(Object.keys(DFPManager.getRegisteredSlots()).length).to.equal(1);
      expect(DFPManager.getRegisteredSlots()).to.contain.all
        .keys([this.slotProps.slotId]);
      expect(DFPManager.getRegisteredSlots()[this.slotProps.slotId])
        .to.contain.all.keys(this.slotProps);
    });

    afterEach(function afterEach() {
      DFPManager.unregisterSlot(this.slotProps);
    });
  });
});
