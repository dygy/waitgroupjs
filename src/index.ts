type Counter = {
    promise: Promise<unknown>,
    resolve: (value?: unknown) => void,
    reject: (err: string) => void,
};

export default class Index {
    private waiting: boolean;
    readonly _counters: Counter[];

    constructor() {
        this.waiting = false;
        this._counters = [];
    }

    add(counter?: number) {
        if (this.waiting) {
            throw new Error('Can\'t call `add` if there\'s an `wait` call waiting resolution');
        }

        if (!counter){
            counter = 1;
        }

        for (let i = 0; i < counter; i++) {
            let resolve : (value: unknown) => void,
                reject: (err: string) => void;

            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;

                this._counters.push({
                    promise,
                    resolve,
                    reject,
                });
            });
        }
    }

    done(err?: string) {
        if (!this.waiting) {
            throw new Error('Can\'t call `done` before `wait`');
        }

        const counter = this._counters.splice(0, 1)[0];

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

            if (this._counters.length === 0) {
                throw new Error('Can\'t call `wait` when there are no counters');
            }

            let timeoutId: NodeJS.Timeout;

            if (timeout) {
                timeoutId = setTimeout(() => {
                    this._counters.forEach((counter)=> {
                        counter.reject('canceled');
                    })
                    reject(new Error('Timeout reached'));
                }, timeout);
            }

            this.waiting = true;
            Promise.all(this._counters.map((counter) => counter.promise))
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
        const length = this._counters.length;
        for (let i = 0; i < length && this.waiting; i++) {
            this.done();
        }
    }
}
