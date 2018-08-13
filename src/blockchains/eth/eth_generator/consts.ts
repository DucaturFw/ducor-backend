import { IDataType } from "../../../IOracleData";

export const FLOAT_PRECISION = 18

export const decimalsMapper = (type: IDataType): number|undefined => {
    switch(type) {
        case 'string':
        case 'uint':
        case 'bytes':
        case 'int':
            return undefined
        case 'price':
        case 'float':
            return FLOAT_PRECISION // DEFAULT VALUE
        default:
            throw new Error('Wrong type provided in ETH contract generator: ' + type)
    }
}

export type IETHType = 'uint' | 'uint8' | 'int' | 'string' | 'price' | 'float'
interface IDTStub
{
    name: string
    hash: string
    type: IETHType
    decimals?: number
}

export interface IETHDataType extends IDTStub
{
    value: string
}

export interface IWideDataType extends IDTStub
{
    [key: string]: string|number|boolean|undefined|IETHType
    value?: string|number|boolean
    life: number
    update: number
}

interface IInput
{
    type: string
    name: string
}

export interface ITypeDef
{
    value: string
    inputs: IInput[]
    evaluate(d: IWideDataType): string
    getter?: string
    in_code?: string
    rettype?: string
    struct_definition?: string
}
export const PUSH_CONSTRUCTION = {
    price: {
        evaluate: (d) => d.value ? `Price(${d.value || 0}, ${d.decimals || 0})` : d.value,
        inputs: [
            { type: 'uint', name: 'value' },
            { type: 'uint8', name: 'decimals' }
        ],
        value: 'Price(value, decimals)',
        getter: '.value',
        rettype: 'uint',
        in_code: 'Price',
        struct_definition: `
    struct Price {
        uint value;
        uint8 decimals;
    }`,
    },
    string: {
        evaluate: (d) => d.value,
        inputs: [{type: 'string', name: 'value'}],
        value: 'value'
    },
    uint: {
        evaluate: (d) => d.value,
        inputs: [{type: 'uint', name: 'value'}],
        value: 'value'
    },
    uint8: {
        evaluate: (d) => d.value,
        inputs: [{type: 'uint8', name: 'value'}],
        value: 'value'
    },
    int: {
        evaluate: (d) => d.value,
        inputs: [{type: 'int', name: 'value'}],
        value: 'value'
    },
} as { [key: string]: ITypeDef }

interface ITypeMapper
{
    <T extends (IDataType & IETHType)>(type: T): T
    (type: IDataType): IETHType
}

export const typeMapper:ITypeMapper = (type: IDataType): IETHType =>
{
    switch (type)
    {
        case 'string':
        case 'uint':
        case 'int':
        case 'price':
            return type
        case 'bytes':
            return 'string'
        case 'float':
            return 'price'
        default:
            throw new Error('Wrong type provided in ETH contract generator: ' + type)
    }
}

export const TIMING_DEFINITION = `
    struct Data {
        uint update_time;
        uint life_time;
        uint last_update;
    }`;
export const MASTER_CONTRACT_DEFINITION = `
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract MasterOracle is Ownable {
    event DataRequest(string name, address receiver);
    function request_data(string name, address receiver) public {
        emit DataRequest(name, receiver);
    }
}`;