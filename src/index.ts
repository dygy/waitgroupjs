type Counter = {
    promise: Promise<unknown>
    resolve: (value?: unknown) => void
    reject: (err: string) => void
}

export default class WaitGroup {
    private waiting: boolean
    readonly _counters: Counter[]

    constructor() {
        this.waiting = false
        this._counters = []
    }

    add(counter?: number) {
        if (this.waiting) {
            throw new Error(
                "Can't call `add` if there's an `wait` call waiting resolution"
            )
        }

        if (!counter) {
            counter = 1
        }

        for (let i = 0; i < counter; i++) {
            let resolve: (value: unknown) => void;
            let reject: (err: string) => void;

            const promise = new Promise((res, rej) => {
                resolve = res
                reject = rej

                this._counters.push({
                    promise,
                    resolve,
                    reject,
                })
            })
        }
    }

    done(err?: string) {
        if (!this.waiting) {
            throw new Error("Can't call `done` before `wait`")
        }

        const counter = this._counters.splice(0, 1)[0]

        if (!counter) {
            throw new Error("Can't call `done` when there are no counters")
        }

        if (err) {
            return counter.reject(err)
        }

        counter.resolve()
    }

    wait(timeout: number, ttl?: number, onOver?: () => void) {
        const bodyFunction = (
            resolve: (value: void | PromiseLike<void>) => void,
            reject: (reason?: any) => void
        ) => {
            if (this.waiting) {
                throw new Error(
                    "There's already an `wait` call waiting resolution"
                )
            }

            if (this._counters.length === 0) {
                throw new Error("Can't call `wait` when there are no counters")
            }

            let timeoutId: NodeJS.Timeout

            if (timeout) {
                timeoutId = setTimeout(() => {
                    this._counters.forEach((counter) => {
                        counter.reject('canceled')
                    })
                    reject(new Error('Timeout reached'))
                }, timeout)
            }

            this.waiting = true

            Promise.all(this._counters.map((counter) => counter.promise))
                .then(() => {
                    return resolve()
                })
                .catch((err) => {
                    return reject(err)
                })
                .finally(() => {
                    clearTimeout(timeoutId)
                    this.waiting = false
                })
        }

        const promise = new Promise<void>(bodyFunction)

        if (ttl) {
            const handler = () => {
                this.ultimatum('race-lose')
                if (onOver) {
                    onOver()
                }
            }

            return Promise.race([promise, setTimeout(handler, ttl)])
        } else {
            return promise
        }
    }

    ultimatum(error?: string) {
        const length = this._counters.length
        for (let i = 0; i < length && this.waiting; i++) {
            this.done(error)
        }
    }
}
