import { IOracleData, IDataGeneric } from "../IOracleData"
import Eos from "eosjs"

let eosInstance: any

export interface IPayload {
  data: IOracleData
  data_id: string
}

export interface IEosOptions {
  chainId: string
  endpoint: string
  keyprovider: string
}

function eos(config: Partial<IEosOptions>) {
  if (eosInstance == null) {
    eosInstance = Eos({
      chainId: config.chainId,
      keyProvider: config.keyprovider,
      httpEndpoint: config.endpoint
    })
  }

  return eosInstance
}

function getContract(contract: string) {
  return eos({
    chainId: process.env.EOS_CHAINID,
    keyprovider: process.env.EOS_PRIVATEKEY,
    endpoint: process.env.EOS_ENDPOINT
  }).contract(contract)
}

function pushContract(instance: any, type: string, hash: string, data: any) {
  return instance[`push${type}`](process.env.EOS_ORACLE_ACCOUNT, hash, data, {
    authorization: [process.env.EOS_ORACLE_ACCOUNT]
  })
}

async function pushPrice(
  contract: string,
  hash: string,
  data: IDataGeneric<"price", { price: number; decimals: number }>
) {
  const instance = await getContract(contract)
  return pushContract(instance, "price", hash, {
    value: data.data.price,
    decimals: data.data.decimals
  })
}

async function pushInt(
  contract: string,
  hash: string,
  data: IDataGeneric<"int", number>
) {
  const instance = await getContract(contract)
  return pushContract(instance, "int", hash, data.data)
}
async function pushUint(
  contract: string,
  hash: string,
  data: IDataGeneric<"uint", number>
) {
  const instance = await getContract(contract)
  return pushContract(instance, "uint", hash, data.data)
}

export default async function push(
  contract: string,
  hash: string,
  data: IOracleData
) {
  switch (data.type) {
    case "price":
      return pushPrice(contract, hash, data)
    case "int":
      return pushInt(contract, hash, data)
    case "uint":
      return pushUint(contract, hash, data)
    default:
      throw new Error("Not implemented data type: " + data.type)
  }
}

export async function sell(contract: string) {
  let instance = await getContract(contract)
  await instance.sell(process.env.EOS_ORACLE_ACCOUNT, 5, {
    authorization: [process.env.EOS_ORACLE_ACCOUNT]
  })
}
