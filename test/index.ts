import assert from 'node:assert/strict';
import test from 'node:test';
import { channel, waitGroup } from '../dist/index.js';

test('channel FIFO add/take', async () => {
    const ch = new channel<number>(3);

    await ch.add(1);
    await ch.add(2);
    await ch.add(3);

    assert.strictEqual(await ch.take(), 1);
    assert.strictEqual(await ch.take(), 2);
    assert.strictEqual(await ch.take(), 3);
});

await test('channel, no buffer, take first', async () => {
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
    await new Promise(resolve => setTimeout(resolve, 6000))
})

await test('waitGroup resolves after all tasks complete', async () => {
    const wg = new waitGroup();
    wg.add(3);

    setTimeout(() => wg.done(), 100);
    setTimeout(() => wg.done(), 200);
    setTimeout(() => wg.done(), 300);

    const start = Date.now();
    await wg.all();
    const end = Date.now();

    assert(end - start >= 300);
});


test('Execute tasks with a maximum of 5 concurrent tasks', async () => {
    const c = new channel<null>(5);
    const wg = new waitGroup();

    console.time('total');

    for (let i = 1; i <= 20; i++) {
        wg.add(1);
        await c.add(null);

        (async () => {
            await asyncTask(i.toString());
            await c.take();
            wg.done();
        })();
    }

    await wg.all();
    console.timeEnd('total');

    // check all tasks done
    assert.strictEqual(c.length(), 0);
});


function asyncTask(id: string) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`finished ${id}`);
            resolve(1);
        }, Math.random() * 1000 + 500);
    });
};
