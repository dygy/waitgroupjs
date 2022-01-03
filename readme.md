#Advanced wait group for JS/TS (with types)

##Installation
npm install ...

## Usage
### done
```typescript
import WaitGroup from 'waitgroupjs';

const wg = new WaitGroup();

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
import WaitGroup from 'waitgroupjs';

const wg = new WaitGroup();

wg.add(2);

const p = wg.wait();

setTimeout(() => {
    wg.ultimatum();
}, 3000);

await p;
```
