import WaitGroup from "../index";

const mock = {
    testFunc: () => {}
}

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

    it('should work with ultimatum', async () => {
        const spy = jest.spyOn(mock, "testFunc");
        const wg = new WaitGroup();
        let isDone = false;

        wg.add(2);
        wg.wait(1000).then(r => {
            isDone = true;
            expect(isDone).toBeTruthy();
            mock.testFunc();
        }).catch((err)=>{
            expect(err).toBeUndefined();
        })
        expect(isDone).toBeFalsy();
        wg.ultimatum();
        await jest.setTimeout(1000);
    });

});
