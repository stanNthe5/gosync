# goSync
Go-style channel and waitGroup for nodejs.

# Why
I made this so that I can control task queue more easily. I guess there will be other use cases.

# Install
```console
npm i gosync
```

# Usage

## channel
```js
import { channel } from 'gosync';
let ch = new channel<number>();
(async () => {
    for (let i = 1; i <= 5; i++) {
        let num = await ch.take()
        console.log('taken', num)
    }
})();

(async () => {
    for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('adding ', i)
        await ch.add(i)
    }
})();

```

## channel and waitGroup
```js

import { channel, waitGroup } from 'gosync';

// Execute 20 tasks with a maximum of 5 concurrent tasks

const ch = new channel<null>(5);
const wg = new waitGroup();

console.time('total');

for (let i = 1; i <= 20; i++) {
    wg.add(1);
    await ch.add(null);
    (async () => {
        await someAsyncTask(i.toString());
        await ch.take();
        wg.done();
    })();
}
await wg.all();
console.timeEnd('total');

function someAsyncTask(id: string) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`finished ${id}`);
            resolve(1);
        }, Math.random() * 1000 + 500);
    });
};

```

