# React DFP &middot; [![Build Status](https://travis-ci.org/jaanauati/react-dfp.svg?branch=master)](https://travis-ci.org/jaanauati/react-dfp) [![](https://img.shields.io/npm/dm/react-dfp.svg?label=DL)](https://github.com/jaanauati/react-dfp) [![Minizipped size](https://img.shields.io/bundlephobia/minzip/react-dfp.svg)](https://github.com/jaanauati/react-dfp) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jaanauati/react-dfp/blob/master/LICENSE) [![](https://img.shields.io/npm/dependency-version/react-dfp/peer/react.svg)](https://github.com/jaanauati/react-dfp/blob/master/LICENSE)

A React implementation of the google [DFP](https://developers.google.com/doubleclick-gpt/reference "GPT Reference") API. This package is inspired in the awesome library [jquery.dfp](https://github.com/coop182/jquery.dfp.js), and aims to provide its same ease of usage but, of course, taking into consideration the react concepts & lifecycle features.

## Installation:

To install just run the following command (no other dependencies are required):

```bash
npm install --save react-dfp
```

or

```bash
yarn add react-dfp
```

You can find more details in the [React-dfp site](https://react-dfp.surge.sh/).

## Getting started

React-dfp has been designed in a very React-ish way, its main goal is to be able to serve DFP ads in your React application just using React components, which means that you won't have to programmatically perform any initialization call when your page loads.

Here a quick example, notice that ads will render in your page as soon as your component is mounted, through its components (DFPSlotsProvider and AdSlot), react-dfp is making a full abstraction of the google dfp/gpt API.

```javascript
import React, { Component } from 'react';
import { DFPSlotsProvider, AdSlot } from 'react-dfp';
...
class Page extends Component {
   render() {
     ...

     return (
        <DFPSlotsProvider>
         ...
         <AdSlot adUnit="home/leaderboard" sizes={[ [900, 90], [728, 90]]} />
         ...
         /* you can override the props */
         <AdSlot adUnit="home/mobile" sizes={[ [300, 250], [300, 600]]} />
         ...
         <div>
           ...
           <AdSlot adUnit="home/footer" sizes={[ [300, 250], [300, 600]]} />
           ...
         </div>
         ...
       </DFPSlotsProvider>
     );
   }
}
```

## Examples

See the [React-dfp site](https://react-dfp.surge.sh) for more examples (basic example, how to have refreshable ads, etc).

## Documentation

You can find the React-dfp documentation [on the website](https://react-dfp.surge.sh). The site is divided into many sections that describe each one the Components, properties and also the DFPManager API (in case you need to use this one manually).

The website is also full of live/working examples.

You can find the source code of the website here: https://github.com/jaanauati/react-dfp-website.

## Wanna help?

I certainly know that test cases need to be improved, but, as long as your syntax is clean, submit test cases and, of course, all the interfaces are kept working, all kind of contribution is welcome.

## Complaints.

Pull requests are welcome 🍻.
