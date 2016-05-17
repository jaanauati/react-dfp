import 'babel-polyfill';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { AdSlot } from '../lib/adslot';


describe('AdSlot', () => {
  beforeEach(function beforeEach() {
    this.component = TestUtils.renderIntoDocument(
      <AdSlot
        dfpNetworkId={1000}
        path={'foo/bar/baz'}
        slotId={'testElement'}
        sizes={[[728, 90]]}
      />
    );
  });

  it('renders an adBox with the given elementId', function rendersAnAdBox() {
    const box = TestUtils.findRenderedDOMComponentWithClass(this.component,
                                                            'adBox');
    expect(box.id).toEqual('testElement');
  });
});
