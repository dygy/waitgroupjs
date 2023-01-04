const WaitGroup = require('../index')

const mock = {
    testFunc: () => {},
    rejFunc: () => {},
}
jest.useRealTimers()

describe('wg', () => {
    it('should wait', async () => {
        const wg = new WaitGroup()
        let isDone = false

        wg.add(2)
        wg.wait(1000)
            .then(() => {
                isDone = true
                expect(isDone).toBeTruthy()
            })
            .catch((err) => {
                expect(err).toBeUndefined()
            })
        expect(isDone).toBeFalsy()
        wg.done()
        wg.done()
        await jest.setTimeout(1000)
    })

    it('should work with ultimatum', (done) => {
        const spy = jest.spyOn(mock, 'testFunc')
        const wg = new WaitGroup()
        let isDone = false

        wg.add(2)
        wg.wait(1)
            .then(() => {
                isDone = true
                expect(isDone).toBeTruthy()
                spy()
            })
        expect(isDone).toBeFalsy()
        wg.ultimatum()

        setTimeout(() => {
            expect(wg._counters).toHaveLength(0)
            expect(isDone).toBeTruthy()
            expect(spy).toBeCalledTimes(1)
            done()
        }, 1000)
    })

    it('should work with ttl', (done) => {
        const spy = jest.spyOn(mock, 'testFunc')
        const spy2 = jest.spyOn(mock, 'rejFunc')
        const wg = new WaitGroup()

        wg.add(2)
        wg.wait(1, 100, spy2)
            .then(() => {})
            .catch(() => {
                spy()
            })

        setTimeout(() => {
            expect(spy2).toBeCalled()
            expect(spy).not.toBeCalledTimes(2)
            expect(wg._counters).toHaveLength(2)
            done()
        }, 1000)
    })
})
