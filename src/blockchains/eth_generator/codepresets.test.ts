import "jest-extended"
import { getContractBase } from './codepresets'
const EXAMPLE_CONTRACT = `pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract MasterOracle is Ownable {
    event DataRequest(string name, address receiver);
    function request_data(string name, address receiver) public {
        emit DataRequest(name, receiver);
    }
}

contract test_contract {
    address data_provider;
    address data_publisher;

    struct Data {
        uint update_time;
        uint life_time;
        uint last_update;
    }
    struct Price {
        uint value;
        uint8 decimals;
    }
    mapping(string => uint) u_data;
    mapping(string => Price) p_data;
    mapping(string => Data) data_timings;

    constructor(address master_oracle, address data_pub) {
        data_provider = master_oracle;
        data_publisher = data_pub;
        data_timings["alh"] = Data(2, 10, block.number);
        u_data["alh"] = 100;
        data_timings["nih"] = Data(5, 100, block.number);
        p_data["nih"] = Price(12345, 2);
    }

    modifier onlyDataPublisher() {
        require(data_publisher == msg.sender);
        _;
    }

    modifier nonEmptyLife(string name) {
        require(data_timings[name].life_time != 0);
        _;
    }

    modifier dataAntique(string name) {
        require(block.number > data_timings[name].last_update + data_timings[name].life_time);
        _;
    }

    modifier dataFresh(string name) {
        require(block.number < data_timings[name].last_update + data_timings[name].life_time);
        _;
    }

    modifier dataNeedRefresh(string name) {
        require(block.number > data_timings[name].last_update + data_timings[name].update_time);
        _;
    }

    /**
     * Check data age:
     * returns true, if data is valid;
     * returns false, if data needs to be updated;
     * throws error, if data is outdated (manual update call needed).
     */
    function check_data_age(string name) dataFresh(name) view private returns(bool) {
        return block.number < (data_timings[name].last_update + data_timings[name].update_time);
    }

    function push_data_uint(string name, uint value) onlyDataPublisher public {
        data_timings[name].last_update = block.number;
        u_data[name] = value;
    }

    function push_data_price(string name, uint value, uint8 decimals) onlyDataPublisher public {
        data_timings[name].last_update = block.number;
        p_data[name] = Price(value, decimals);
    }

    function request_data_manually(string name) nonEmptyLife(name) dataAntique(name) public {
        MasterOracle master = MasterOracle(data_provider);
        master.request_data(name, this);
    }

    function request_data(string name) nonEmptyLife(name) dataNeedRefresh(name) private {
        MasterOracle master = MasterOracle(data_provider);
        master.request_data(name, this);
    }

    function getAloha() dataFresh("alh") public returns (uint) {
        if (!check_data_age("alh")) {
            request_data("alh");
        }
        return u_data["alh"];
    }
    
    function getNihao() dataFresh("nih") public returns (uint) {
        if (!check_data_age("nih")) {
            request_data("nih");
        }
        return p_data["nih"].value;
    }
}`.replace(/\x20+$/gm, "");

describe('ETH Contract constructor', () => {
    it('should create similar contract', () => {
        const created = getContractBase(
            'test_contract', [
                { hash: 'alh', name: 'Aloha', value: 100, type: 'uint', life: 10, update: 2 },
                { hash: 'nih', name: 'Nihao', value: 12345, decimals: 2, type: 'price', life: 100, update: 5 },
            ]
        );
        expect(created).toEqual(EXAMPLE_CONTRACT);
    })
})
