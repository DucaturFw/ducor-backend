import "jest-extended"
import {evaluator, IWideDataType, PUSH_CONSTRUCTION} from "./consts";

describe("Regression test for empty value or decimals", () => {
    it('should return default value in evaluator if value is empty', () => {
        expect(evaluator(<IWideDataType>{type: 'price'})).toEqual(PUSH_CONSTRUCTION['price'].default);
        expect(evaluator(<IWideDataType>{type: 'string'})).toEqual(PUSH_CONSTRUCTION['string'].default);
    })
})