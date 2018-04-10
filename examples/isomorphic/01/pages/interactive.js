import React from 'react';
import { DFPSlotsProvider, DFPManager, AdSlot } from 'react-dfp';
import Highlight from 'react-syntax-highlighter';

const network = process.env.npm_package_config_dfp_id;

const adunit1 = process.env.npm_package_config_adunit_1;
const adunit2 = process.env.npm_package_config_adunit_2;
const adunit3 = process.env.npm_package_config_adunit_3;

/* we pass all the default props through <DFPSlotsProvider> and then all
 * its netsted AdSlot children will pick the values.
 */
export default class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      extraSlots: 0,
    };
  }

  render() {
    return (
      <div>
        <DFPSlotsProvider collapseEmptyDivs dfpNetworkId={network}>
          <div>
            <div className="ad-example-728x90">
              <AdSlot adUnit={adunit1} sizes={[[728, 90]]} />
              <Highlight>
                {'<AdSlot sizes={[[728, 90]]}/>'}
              </Highlight>
            </div>
            <div className="ad-example-300x250">
              <AdSlot adUnit={adunit2} sizes={[[728, 90]]} />
              <Highlight>
                {'<AdSlot sizes={[[300, 250]]}/>'}
              </Highlight>
            </div>
          </div>
          <div className="extraSlots">
            {
              Array.apply(null, { length: this.state.extraSlots }).map((e, i) => (
                <AdSlot key={i} adUnit={adunit3} sizes={[[300, 250]]} onSlotIsViewable={function(slot){ console.log('slot viewable!', slot); }}/>
              ))
            }
          </div>
        </DFPSlotsProvider>

        <div className="controls">
          <button onClick={() => { this.setState({ extraSlots: this.state.extraSlots + 1 }); }} > Add Slot </button>
          <br />
          <button onClick={() => DFPManager.refresh()}> Refresh ads</button>
          <Highlight>
            {'<button onClick={()=> DFPManager.refresh()}> Refresh ads</button>'}
          </Highlight>
        </div>
      </div>
    );
  }
}
