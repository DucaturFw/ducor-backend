import { IOracleData, IDataGeneric, IDataType } from "../../IOracleData"
import Eos, { IEosContract } from "eosjs"
import { ITxPushResult } from "../../IBlockchain"

let eosInstance: any

export interface IPayload {
  data: IOracleData
  data_id: string
}

export interface IEosPushOptions {
  chainId: string
  endpoint: string
  keyprovider: string
  master: string
}

function eos(config: IEosPushOptions) {
  if (eosInstance == null) {
    eosInstance = Eos({
      chainId: config.chainId,
      keyProvider: config.keyprovider,
      httpEndpoint: config.endpoint
    })
  }

  return eosInstance
}

function getContract(config: IEosPushOptions) {
  return eos(config).contract(config.master)
}

function assertEnv() {
  console.assert(process.env.DUCOR_EOS_CHAINID, 'DUCOR_EOS_CHAINID not found in .env!')
  console.assert(process.env.DUCOR_EOS_ORACLE_PRIVATEKEY, 'DUCOR_EOS_ORACLE_PRIVATEKEY not found in .env!')
  console.assert(process.env.DUCOR_EOS_ENDPOINT, 'DUCOR_EOS_ENDPOINT not found in .env!')
  console.assert(process.env.DUCOR_EOS_MASTER_ORACLE, 'DUCOR_EOS_MASTER_ORACLE not found in .env!')
}

function getOptions() : IEosPushOptions {
  return (assertEnv(), {
    chainId: process.env.DUCOR_EOS_CHAINID!,
    keyprovider: process.env.DUCOR_EOS_ORACLE_PRIVATEKEY!,
    endpoint: process.env.DUCOR_EOS_ENDPOINT!,
    master: process.env.DUCOR_EOS_MASTER_ORACLE!
  })
}

function pack(instance : IEosContract, data : IOracleData) : Buffer {
  console.log(data)
  switch(data.type) {
    case "bytes":
      return instance.fc.toBuffer('bytes', data.data);
    case "price":
      return instance.fc.toBuffer('price', {
        value: data.data.price, 
        decimals: data.data.decimals
      });
    case "uint":
      return instance.fc.toBuffer('uint64', data.data);
    case "int":
      return instance.fc.toBuffer('int64', data.data);
    case "float":
      const raw = data.data;
      const value = Math.floor(raw * 1e8);
      const decimals = 8;
      return instance.fc.toBuffer('price', {
        value,
        decimals
      });
  }

  throw new Error("Unkown data type");
}

export default async function push(
  contract: string,
  hash: string,
  data: IOracleData,
  memo?: string
): Promise<ITxPushResult<boolean>> {
  const options = getOptions();
  const instance = await getContract(options);
  // void push(account_name oracle, account_name contract, string task, string memo, bytes data)
  const tx = await instance.push(
    process.env.DUCOR_EOS_ORACLE_ACCOUNT,
    contract,
    hash,
    memo || "",
    pack(instance, data),
    {
      authorization: [process.env.DUCOR_EOS_ORACLE_ACCOUNT]
    }
  )

  return {
    txhash: tx.transaction_id,
    result: true
  }
}
