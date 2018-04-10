
How to run this example:

1) install deps:
```
nvm use
npm install
```
2) Configure your preferences (fallback values are available in package.json)

```
npm config set react-dfp-isomorphic-01:dfp_id 'yourid'
npm config set react-dfp-isomorphic-01:adunit_1 'foo/1'
npm config set react-dfp-isomorphic-01:adunit_2 'bar/2'
npm config set react-dfp-isomorphic-01:adunit_3 'baz/3'

```

3) Run the server:
```
npm run dev
```

4) Test the pages:

- http://localhost:3000/
- http://localhost:3000/interactive
- http://localhost:3000/adSense
