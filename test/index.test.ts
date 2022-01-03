import WaitGroup from "../src/index";

const mock = {
    testFunc: () => {}
}
jest.useRealTimers();

describe('wg', () => {
    it('should wait', async () => {
        const wg = new WaitGroup();
        let isDone = false;

        wg.add(2);
        wg.wait(1000).then(r => {
            isDone = true;
            expect(isDone).toBeTruthy();
        }).catch((err) => {
            expect(err).toBeUndefined();
        })
        expect(isDone).toBeFalsy();
        wg.done();
        wg.done();
        await jest.setTimeout(1000);
    });

    it('should work with ultimatum',  (done) => {
        const spy = jest.spyOn(mock, "testFunc");
        const wg = new WaitGroup();
        let isDone = false;

        wg.add(2);
        wg.wait(1).then(r => {
            isDone = true;
            expect(isDone).toBeTruthy();
            mock.testFunc();
        }).catch((err)=>{
            // expect(err).toBeUndefined();
        })
        expect(isDone).toBeFalsy();
        wg.ultimatum();

        setTimeout(() => {
            expect(wg.counters).toHaveLength(0);
            expect(isDone).toBeTruthy();
            done()
        }, 1000)
    });

});
