import Push from "../eth/Push.json"
import { IOracleData, IDataGeneric } from "../../IOracleData"
import { ITxPushResult } from "../../IBlockchain"
import {getContract, getOptions, getQtumRPC} from "./provider";

async function pushContract(receiver: string, type: string, hash: string, ...args: any[]) : Promise<ITxPushResult<boolean>> {
  // todo: cache options and rpc
  const opts = getOptions();
  const qtumrpc = getQtumRPC(opts.qtumProvider, opts.oraclePublicKey, opts.oraclePrivateKey);
  const instance = getContract(qtumrpc, Push, receiver);
  
  console.log(`push_data_${type}`, hash, ...args)
  const tx = await instance.send(`push_data_${type}`,[hash, ...args]);
  const confirmation = await tx.confirm(3)

  return {
    txhash: confirmation.transactionHash,
    result: true
  }
}

async function pushPrice(
  contract: string,
  hash: string,
  data: IDataGeneric<"price", { price: number; decimals: number }>
) : Promise<ITxPushResult<boolean>> {

  return pushContract(contract, "price", hash, data.data.price, data.data.decimals)
}

async function pushInt(
  contract: string,
  hash: string,
  data: IDataGeneric<"int", number>
) : Promise<ITxPushResult<boolean>> {

  return pushContract(contract, "int", hash, data.data)
}
async function pushUint(
  contract: string,
  hash: string,
  data: IDataGeneric<"uint", number>
) : Promise<ITxPushResult<boolean>> {

  return pushContract(contract, "uint", hash, data.data)
}

export async function push(
  contract: string,
  hash: string,
  data: IOracleData
) : Promise<ITxPushResult<boolean>> {
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
