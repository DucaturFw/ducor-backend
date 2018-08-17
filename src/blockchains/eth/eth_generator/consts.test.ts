import "jest-extended"
import { decimalsMapper, FLOAT_PRECISION, IWideDataType, PUSH_CONSTRUCTION } from "./consts"
import { IDataType } from "../../../IOracleData"

describe("Regression test for evaluator", () => {
    /// for all types
    Object.keys(PUSH_CONSTRUCTION).forEach(type => {
        it('should return undefined if value is not defined', () => {
            expect(PUSH_CONSTRUCTION[type].evaluate(<IWideDataType>{type})).toEqual(undefined);
        })
    })

    it('should return provided value in evaluator if value is not empty', () => {
        expect(PUSH_CONSTRUCTION['price'].evaluate(<IWideDataType>{type: 'price', value: 12345})).toEqual('Price(12345, 0)');
        expect(PUSH_CONSTRUCTION['price'].evaluate(<IWideDataType>{type: 'price', value: 12345, decimals: 2})).toEqual('Price(12345, 2)');
        expect(PUSH_CONSTRUCTION['string'].evaluate(<IWideDataType>{type: 'string', value: 'unique'})).toEqual('unique');
    })

    it('should return precision', () => {
        expect(decimalsMapper('float')).toEqual(FLOAT_PRECISION);
        ;['string', 'int', 'uint', 'bytes'].forEach(type => {
            expect(decimalsMapper(<IDataType>type)).toEqual(undefined);
        })
    })
})