import 'babel-polyfill';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { AdSlot } from '../js/adslot';


describe('AdSlot', function adSlot() {
  beforeEach(function beforeEach() {
    this.component = TestUtils.renderIntoDocument(
      <AdSlot dfpNetworkId={1000} path={"foo/bar/baz"}
              elementId={'testElement'} sizes={[[728, 90]]}/>
    );
  });

  it('renders an adBox with the given elementId', function itRendersAnAdBox() {
    const box = TestUtils.findRenderedDOMComponentWithClass(this.component,
                                                            'adBox');
    expect(box.id).toEqual('testElement');
  });
});
