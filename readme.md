# Advanced wait group for JS/TS (with types)

## Installation
```shell
    npm i advanced_waitgroup_js
```

## Usage
### done
```typescript
import Index from "advanced_waitgroup_js";

const wg = new Index();

wg.add(2);

const p = wg.wait();

setTimeout(() => {
    wg.done();
}, 5000);

setTimeout(() => {
    wg.done();
}, 3000);

await p;
````
### ultimatum
```typescript
import Index from "advanced_waitgroup_js";

const wg = new Index();

wg.add(2);

const p = wg.wait();

setTimeout(() => {
    wg.ultimatum();
}, 3000);

await p;
```
