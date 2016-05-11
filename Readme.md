# React DFP
Inspired on jquery.dfp, thi
## Install:
```
npm install --save-dev react-dfp
```

## Usage + Demos

1) Create the adslots:
```
   import {AdSlot} from 'react-dfp';
   ...
   <AdSlot dfpNetworkId={9999} path={"foo/bar/baz"} sizes={[ [900, 90], [728, 90]]}/>
   
   <AdSlot dfpNetworkId={9999} path={"foo/bar/baz"} sizes={[ [300, 250], [300, 600]]}/>
```
2) Render ads:
```
import {DFPManager} from 'react-dfp';
...
DFPManager.load();
```

## Options

### AdSlot

| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| dfpNetworkId       | string (required)  |  ``` "1122" ```      | DFP Account id. |
| adUnit             | string (required)  |  ``` "homepage" ```   | The adunit you want to target to this box. |
| sizes              | array (required)   |  ```[ [300, 250], [300, 600] ] ``` | list of sizes that this box support ([width, height]). You can configure 1 or more sizes.|
| targetingArguments | object (optional) | ``` { "keywords": "family", "content": "test" } ``` | Object with attributes you want to add to this box (you can use for custom targeting) |
| onSlotRender       | fcn. (optional) | ``` function(eventData) { console.log(eventData.size); } ``` | This callback is executed after the adSlot is rendered. The first argument passes the gpt event data (googletag.events.SlotRenderEndedEvent). |
| shouldRefresh      | fcn. (optional) (should return a boolean)| ``` function() { /* never refresh this ad */ return false; } ``` |             |
| slotId          | string. (optional) | ``` "homepage-leadboard" ``` | Controls the id of the dom element in which the dom is displayed. If this field is not provided a random name is created. |

### DFPManager

#### Public methods
| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| load               | ```fcn() ```| ```DFPManager.init(); ```  | Fetch gpt api (by calling init()) and render the ad slots in the page. |
| refresh            | ``` fcn() ``` | ``` DFPManager.refresh(); ``` | Refreshes the ad slots available in the page. This method will call load() if it wasn't already called. Use the method ```<AdSlot shouldRefresh={function(){}} ...>``` to get control over the slots to be refreshed. |
| targetingArguments |               |             |             |

#### For Internal Usage Only
| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| init               | ```fcn() => Promise ```| ```DFPManager.init(); ```| Fetch the gpt scripts from network. Returns a promise that resolves when the gpt api is ready for usage. |
| attachSlotRenderEnded  | ``` fcn( fcn({slotId, event}) ) ``` | ``` DFPManager.attachSlotRenderEnded((id, event) => {console.log(event.size); }) ``` | Attaches a callback that will be called when an ad slot is rendered (or refreshed). slotId is the id of slot. event is the gpt event data. |
| detachSlotRenderEnded | ``` fcn(callback) ``` | ``` DFPManager.detachSlotRenderEnded(myCallback) ``` | Detaches the callback. |
