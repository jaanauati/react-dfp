# React DFP
Inspired on jquery.dfp, thi

## Usage + Demos

1) Create the adslots:
```
   import {AdSlot} from 'react-dfp';
   ...
   <AdSlot dfpNetworkId={9999} path={"foo/bar/baz"} elementId={'testElement'} sizes={[ [900, 90], [728, 90]]}/>
   
   <AdSlot dfpNetworkId={9999} path={"foo/bar/baz"} elementId={'testElement'} sizes={[ [300, 250], [300, 600]]}/>
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
| dfpNetworkId       | Content Cell  |             |             |
| path               | Content Cell  |             |             |
| elementId          |               |             |             |
| sizes              |               |             |             |
| targetingArguments |               |             |             |
| onSlotRender       |               |             |             |
| shouldRefresh      |               |             |             |


### DFPManager
| Property           | Type          | Example     | Description |
| ------------------ | ------------- | ----------- | -------     |
| init               | Content Cell  |             |             |
| load               | Content Cell  |             |             |
| refresh            |               |             |             |
| registerSlot       |               |             |             |
| targetingArguments |               |             |             |
| unregisterSlot     |               |             |             |
| onSlotRenderEnded  |               |             |             |
| offSlotRenderEnded |               |             |             |
