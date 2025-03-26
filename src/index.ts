// A class that implements a Channel (like a queue) with a maximum capacity
export class channel<T> {
    // The queue that holds waiting items when the channel is full
    private queue: { resolve: (v: any) => void, item: T }[] = [];
    // The list of items currently in the channel
    private items: T[] = [];
    // The queue of waiting consumers (take operations) that are waiting for items to become available
    private takeQueue: ((v: any) => void)[] = [];

    // Constructor accepts the maximum size of the channel
    constructor(private buffer: number = 0) { }

    // Adds an item to the channel
    async add(item: T) {
        // If there are consumers waiting for items, fulfill the first one
        if (this.takeQueue.length) {
            let resolve = this.takeQueue.shift(); // Get the first waiting consumer
            if (resolve) {
                return resolve(item); // Fulfill the consumer's promise with the item
            }
        }

        // If the channel is not full, add the item to the channel directly
        if (this.items.length < this.buffer) {
            this.items.push(item);
            return;
        } else {
            // If the channel is full, return a promise that will resolve when space is available
            return new Promise<void>((resolve) => this.queue.push({ resolve, item }));
        }
    }

    // Takes an item from the channel
    async take(): Promise<T | undefined> {
        // If there are no items available, wait for an item to be added
        if (!this.items.length) {
            return new Promise<T>((resolve) => this.takeQueue.push(resolve)); // Push resolve function to takeQueue
        }

        // Retrieve the first item from the channel
        let item = this.items.shift();
        // If there are items in the queue, move one item to the channel
        if (this.queue.length) {
            let queue = this.queue.shift(); // Get the first item waiting in the queue
            if (queue) {
                queue.resolve(1); // Fulfill the waiting promise with some value (could be `1` as a dummy value)
                this.items.push(queue.item); // Push the item to the channel
            }
        }

        // Return the item that was taken
        return item;
    }

    // Returns the current number of running tasks in the channel
    length(): number {
        return this.items.length;
    }

}

// A class that implements a simple WaitGroup pattern, to track the completion of multiple tasks
export class waitGroup {
    // The number of tasks to wait for
    private taskNum = 0;
    // A function to resolve the promise when all tasks are done
    private resolve?: (value: unknown) => void;

    // Adds a number of tasks to wait for
    add(n: number) {
        this.taskNum += n;
    }

    // Marks one task as completed
    done() {
        this.taskNum--;
        // If all tasks are done, resolve the promise
        if (!this.taskNum && this.resolve) {
            this.resolve(1);
        }
    }

    // Returns a promise that resolves when all tasks are completed
    all() {
        return new Promise(resolve => {
            this.resolve = resolve;
        });
    }
}
