import { IDataType } from "../../IOracleData";

export type ETHType = 'uint' | 'uint8' | 'int' | 'string' | 'price'
export interface IETHDataType
{
    name: string
    hash: string
    type: ETHType
    value: string
    decimals?: number
}
export interface IWideDataType extends IETHDataType { value: any; life: number; update: number }
export const evaluator = (d: IWideDataType) => {
    switch (d.type) {
        case 'price': return !!d.value ? `Price(${d.value}, ${!!d.decimals ? d.decimals : 0})` : PUSH_CONSTRUCTION[d.type].default
        default: break;
    }
    return !!d.value ? d.value : PUSH_CONSTRUCTION[d.type].default;
}
interface IInput
{
    type: string
    name: string
}
export interface ITypeDef
{
    default: string
    value: string
    inputs: IInput[]
    getter?: string
    in_code?: string
    rettype?: string
    struct_definition?: string
}
export const PUSH_CONSTRUCTION = {
    price: {
        default: 'Price(0, 0)',
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
        default: '',
        inputs: [{type: 'string', name: 'value'}],
        value: 'value'
    },
    uint: {
        default: '0',
        inputs: [{type: 'uint', name: 'value'}],
        value: 'value'
    },
    uint8: {
        default: '0',
        inputs: [{type: 'uint8', name: 'value'}],
        value: 'value'
    },
    int: {
        default: '0',
        inputs: [{type: 'int', name: 'value'}],
        value: 'value'
    },
} as { [key: string]: ITypeDef }

export const typeMapper = (type: IDataType): ETHType => {
    if (Object.keys(PUSH_CONSTRUCTION).includes(type.toLowerCase())) return <ETHType>(type.toLowerCase());
    switch (type) {
        case 'bytes': return 'string'
        default: break;
    }
    throw new Error('Wrong type provided in ETH contract generator: ' + type)
}

export const VALID_TYPES = Object.keys(PUSH_CONSTRUCTION);
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