import React from 'react';
import { DFPSlotsProvider, DFPManager, AdSlot } from 'react-dfp';
import Highlight from 'react-syntax-highlighter';

const network = process.env.npm_package_config_dfp_id;
const adunit1 = process.env.npm_package_config_adunit_1;

export default () => (
  <div>
    <DFPSlotsProvider collapseEmptyDivs adSenseAttributes={{ 'page_url': 'HelloURL' }} dfpNetworkId={network} adUnit={adunit1}>
      <div>
        <div className="ad-example-728x90">
          <AdSlot sizes={[[728, 90]]} adSenseAttributes={{ adsense_link_color: '#00FFFF', adsense_background_color: '#000000' }} />
          <Highlight>
            {'<AdSlot sizes={[[728, 90]]}/>'}
          </Highlight>
        </div>
        <div className="ad-example-300x250">
          <AdSlot sizes={[[300, 250]]} adSenseAttributes={{ adsense_ad_types: 'text_image' }} />
          <Highlight>
            {'<AdSlot sizes={[[300, 250]]}/>'}
          </Highlight>
        </div>
      </div>
    </DFPSlotsProvider>

    <div className="controls">
      <button onClick={() => DFPManager.refresh()}> Refresh ads</button>
      <Highlight>
        {'<button onClick={()=> DFPManager.refresh()}> Refresh ads</button>'}
      </Highlight>
    </div>
  </div>
)
