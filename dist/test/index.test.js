"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const mock = {
    testFunc: () => { }
};
jest.useRealTimers();
describe('wg', () => {
    it('should wait', () => __awaiter(void 0, void 0, void 0, function* () {
        const wg = new index_1.default();
        let isDone = false;
        wg.add(2);
        wg.wait(1000).then(r => {
            isDone = true;
            expect(isDone).toBeTruthy();
        }).catch((err) => {
            expect(err).toBeUndefined();
        });
        expect(isDone).toBeFalsy();
        wg.done();
        wg.done();
        yield jest.setTimeout(1000);
    }));
    it('should work with ultimatum', (done) => {
        const spy = jest.spyOn(mock, "testFunc");
        const wg = new index_1.default();
        let isDone = false;
        wg.add(2);
        wg.wait(1).then(r => {
            isDone = true;
            expect(isDone).toBeTruthy();
            mock.testFunc();
        }).catch((err) => {
            // expect(err).toBeUndefined();
        });
        expect(isDone).toBeFalsy();
        wg.ultimatum();
        setTimeout(() => {
            expect(wg.counters).toHaveLength(0);
            expect(isDone).toBeTruthy();
            done();
        }, 1000);
    });
});
