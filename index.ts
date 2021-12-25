type Counter = {
  promise: Promise<unknown>,
  resolve: () => unknown,
  reject: (err) => unknown,
};

export default class WaitGroup {
    private waiting: boolean;
    private readonly counters: Counter[];

    constructor() {
        this.waiting = false;
        this.counters = [];
    }

    add(counter?: number) {
        if (this.waiting) {
            throw new Error('Can\'t call `add` if there\'s an `wait` call waiting resolution');
        }

        if (!counter){
            counter = 1;
        }

        for (let i = 0; i < counter; i++) {
            let resolve,
                reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });

            this.counters.push({
                promise,
                resolve,
                reject
            });
        }
    }

    done(err?: string) {
        if (!this.waiting) {
            throw new Error('Can\'t call `done` before `wait`');
        }

        const counter = this.counters.splice(0, 1)[0];

        if (!counter) {
            throw new Error('Can\'t call `done` when there are no counters');
        }

        if (err) {
            return counter.reject(err);
        }

        counter.resolve();
    }

    wait(timeout: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.waiting) {
                throw new Error('There\'s already an `wait` call waiting resolution');
            }

            if (this.counters.length === 0) {
                throw new Error('Can\'t call `wait` when there are no counters');
            }

            let timeoutId;

            if (timeout) {
                timeoutId = setTimeout(() => {
                    this.counters.forEach((counter)=> {
                        counter.reject('canceled');
                    })
                    reject(new Error('Timeout reached'));
                }, timeout);
            }

            this.waiting = true;
            Promise.all(this.counters.map((counter) => counter.promise))
                .then(() => {
                    return resolve();
                }).catch((err) => {
                    return reject(err);
                }).finally(() => {
                    clearTimeout(timeoutId);
                    this.waiting = false;
                });
        });
    }

    ultimatum() {
        this.counters.forEach(()=>{
            this.done();
        })
    }
}
