# goSync
Go-style channel and waitGroup for nodejs.

# Why
To control concurrent tasks more intuitively and easily .

# Install
```console
npm i gosync
```

# Usage

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

