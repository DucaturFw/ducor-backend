import "jest-extended"
import {evaluator, IWideDataType, PUSH_CONSTRUCTION} from "./consts";

describe("Regression test for empty value or decimals", () => {
    it('should return default value in evaluator if value is empty', () => {
        expect(evaluator(<IWideDataType>{type: 'price'})).toEqual(PUSH_CONSTRUCTION['price'].default);
        expect(evaluator(<IWideDataType>{type: 'string'})).toEqual(PUSH_CONSTRUCTION['string'].default);
    })
    it('should return provided value in evaluator if value is not empty', () => {
        expect(evaluator(<IWideDataType>{type: 'price', value: 12345})).toEqual('Price(12345, 0)');
        expect(evaluator(<IWideDataType>{type: 'price', value: 12345, decimals: 2})).toEqual('Price(12345, 2)');
        expect(evaluator(<IWideDataType>{type: 'string', value: 'unique string'})).toEqual('unique string');
    })
})