# React DFP  [![Build Status](https://travis-ci.org/jaanauati/react-dfp.svg?branch=master)](https://travis-ci.org/jaanauati/react-dfp)

Gpt/dfp components that you can easily use in your isomorphic react apps. This package is inspired in the awesome library [jquery.dfp](https://github.com/coop182/jquery.dfp.js), and aims to provide its same ease of usage but, of course, taking into consideration the react concepts & lifecycle features.


## Install:
```bash
npm install --save-dev react-dfp
```

## Usage

1) Create the adslots:
```javascript
   import { DFPSlotsProvider, AdSlot } from 'react-dfp';

   <DFPSlotsProvider dfpNetworkId={'9999'} adUnit={"foo/bar/baz"} ... >
     ...
      <AdSlot sizes={[ [900, 90], [728, 90]]} />
     ...
      /* you can override the props */
      <AdSlot adUnit={"home/mobile"} sizes={[ [300, 250], [300, 600]]} />
     ...
   </DFPSlotsProvider>
```
2) (*Optional*) Render or refresh the ads:
```javascript
import { DFPManager } from 'react-dfp';
...
/* If you are using ``` <DFPSlotsProvider> ``` the following call won't be required,  
 * unless you has set the property ``` autoLoad={false} ```.
 */
DFPManager.load();
...
DFPManager.refresh();
```

## Examples:

1) Basic:
```javascript
import React from 'react';
import ReactDom from 'react-dom';
import { DFPSlotsProvider, AdSlot } from 'react-dfp';

ReactDom.render(
  <DFPSlotsProvider dfpNetworkId='9999' targetingArguments={ {'customKw': 'test'} }
                sizeMapping={ [ {viewport: [1024, 768], sizes:[[728, 90], [300, 250]]},
                                {viewport: [900, 768], sizes:[[300, 250]] }] }>
    <div className="desktop-ads">
      <AdSlot sizes={[[728,90], [300, 250]]} adUnit='homepage/1' />
    </div>
    <div className="mobile-ads">
      <AdSlot sizes={[[320,50], [300, 50]]} adUnit='homepage/mobile' />
    </div>
    ...
  </DFPSlotsProvider>,
document.querySelectorAll(".ad-container")[0]);
```

2) (manually) Add and refresh ads.
```javascript
import React from 'react';
import ReactDom from 'react-dom';

import {AdSlot, DFPManager} from 'react-dfp';

function loadSecondaryAd() {
    ReactDom.render(<AdSlot sizes={[[300, 250]]}
                         dfpNetworkId='9999'
                         adUnit='homepage/2'
                         />,
                    document.querySelectorAll(".ad-container-2")[0]);
}

ReactDom.render( <AdSlot sizes={[[728,90], [300, 250]]}
                         dfpNetworkId='9999'
                         adUnit='homepage/1'
                         targetingArguments={ {'customKw': 'test'} }
                         sizeMapping={ [ {viewport: [1024, 768], sizes:[[728, 90], [300, 250]]},
                                         {viewport: [900, 768], sizes:[[300, 250]] }] }
                         onSlotRender={loadSecondaryAd}
                         /* never refresh this adSlot */
                         shouldRefresh={ ()=> false }
                         />,
                document.querySelectorAll(".ad-container")[0]);
DFPManager.setTargetingArguments({'key': 'oh'});

// refresh ads every 15 seconds
window.setInterval(function refreshAds() { DFPManager.refresh(); }, 15000);

DFPManager.load();
```

## Options

### DFPSlotsProvider

| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| autoLoad           | bool (default true) |  ``` { false } ```      | Tell to the provider if it should load the ads when the slots are mounted. |
| dfpNetworkId       | string  |  ``` "1122" ```      | DFP Account id. |
| adUnit             | string  |  ``` "homepage" ```   | The adunit you want to target the boxes (children / contained boxes). |
| sizeMapping        | array of objects.    | ```{ [ {viewport: [1024, 768], sizes:[[728, 90], [300, 250]]}, {viewport: [900, 768], sizes:[[300, 250]] }] } ``` | Set the size mappings to be applied to the nested ad slots. |
| targetingArguments | object | ``` { "keywords": "family", "content": "test" } ``` | Object with attributes you want to add to the boxes (you can use for custom targeting) |
| collapseEmptyDivs | boolean | ```{ false }``` | Enables collapsing of slot divs when there is no ad content to display. |

### AdSlot

| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| dfpNetworkId       | string (required)  |  ``` "1122" ```      | DFP Account id. |
| adUnit             | string (required)  |  ``` "homepage" ```   | The adunit you want to target to this box. |
| sizes              | array (required)   |  ```[ [300, 250], [300, 600], 'fluid' ] ``` | list of sizes that this box support. Sizes can be specified by eigther and array like [width, height] or with strings ("dfp named sizes") like 'fluid'. You can configure 1 or more sizes.|
| sizeMapping        | array of objects.    | ```{ [ {viewport: [1024, 768], sizes:[[728, 90], [300, 250]]}, {viewport: [900, 768], sizes:[[300, 250]] }] }``` | Set the size mappings to be applied to the adSlot. |
| targetingArguments | object (optional) | ``` { "keywords": "family", "content": "test" } ``` | Object with attributes you want to add to this box (you can use for custom targeting) |
| onSlotRender       | fcn. (optional) | ```function(eventData) { console.log(eventData.size); } ``` | This callback is executed after the adSlot is rendered. The first argument passes the gpt event data (googletag.events.SlotRenderEndedEvent). |
| shouldRefresh      | fcn. (optional) (should return a boolean)| ``` function() { /* never refresh this ad */ return false; } ``` | Return a boolean that tells the dfp manager whether the ad slot can be refreshed or not. |
| slotId          | string. (optional) | ``` "homepage-leadboard" ``` | Controls the id of the dom element in which the dom is displayed. If this field is not provided a random name is created. |

### DFPManager

#### Public methods
| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| load               | ```fcn([slotId]) ```| ```DFPManager.load(); ```  | Fetches the gpt api (by calling init()) and renders the ad slots in the page. You can specify an individual slot. |
| refresh            | ``` fcn() ``` | ```DFPManager.refresh(); ``` | Refreshes the ad slots available in the page. This method will call load() if it wasn't already called. Use the method ```<AdSlot shouldRefresh={function(){}} ...>``` to get control over the slots to be refreshed. |
| targetingArguments | object (optional) | ``` { "keywords": "family", "content": "test" } ``` | Object with attributes you want to enable globaly (you can use this for custom targeting) |
| getGoogletag | ```fcn() => Promise ```| ``` DFPManager.getGoogletag().then( googletag => { console.log(googletag); }); ``` | Returns a promise that resolves when the object googletag object is ready for usage (if required this fcn makes the network call to fetch the scripts). |
| setCollapseEmptyDivs | ```fcn(boolean)``` | ```DFPManager.setCollapseEmptyDivs( true )``` | Enables collapsing of slot divs when there is no ad content to display. The method accepts one parameter that expects the following values: false: collapse after ads are fetched; true: collapse divs  before ads are fetched; null/undefined: do not collapse divs. |

#### For Internal Usage Only
| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| init               | ```fcn() => Promise ```| ```DFPManager.init(); ```| Initializes the dfp manager (fetches the gpt scripts from network). Returns a promise that resolves when the gpt api is ready for usage. |
| attachSlotRenderEnded  | ``` fcn( fcn({slotId, event}) ) ``` | ``` DFPManager.attachSlotRenderEnded((id, event) => {console.log(event.size); }) ``` | Attaches a callback that will be called when an ad slot is rendered (or refreshed). slotId is the id of slot. event is the gpt event data. |
| detachSlotRenderEnded | ``` fcn(callback) ``` | ``` DFPManager.detachSlotRenderEnded(myCallback) ``` | Detaches the callback. |
| getRegisteredSlots | ``` fcn() => {} ``` | ``` Object.keys(DFPManager.getRegisteredSlots()) ``` | Returns an object whose attributes are the registered slots. Example: ``` { slotId: { data }, .... }```|
| getRefreshableSlots | ``` fcn() => { slotId:{ slot }, ... } ``` | ``` console.log(DFPManager.getRegisteredSlots().length); ``` | Returns an object whose properties are slots that can be refreshed (see property ```shouldRefresh``` ). |
| getTargetingArguments | ``` fcn() => {} ``` | ``` Object.keys(DFPManager.getTargetingArguments()) ``` | Returns an object that contains the targeting arguments (configured through ```DFPManager.setTargetingArguments()```) |
| getSlotTargetingArguments | ``` fcn(slotId) => {} ``` | ``` console.log(DFPManager.getSlotTargetingArguments('slot-five')['the-key']); ``` | Returns an object that contains the custom targeting arguments that were set for the given slot (slotId). |  

## Wanna help?
I certainly know that testcases need to be improved, but, as long as your syntax is clean, submit testscases and, of course, all the interfaces are kept working, all kind of contribution is welcome.

## Complaints.
Pull requests are welcome 🍻.
