import Push from "../eth/Push.json"
import { IOracleData } from "../../IOracleData"
import { ITxPushResult } from "../../IBlockchain"
import { getContract, getOptions, getQtumRPC } from "./provider";
import { push as ethPush } from "../eth/eth-push";

async function pushDataQtum(receiver: string, type: string, hash: string, ...args: any[]) : Promise<ITxPushResult<boolean>> {
  // todo: cache options and rpc
  const opts = getOptions();
  const qtumrpc = getQtumRPC(opts.qtumProvider, opts.oraclePublicKey, opts.oraclePrivateKey);
  const instance = getContract(qtumrpc, Push, receiver);
  
  console.log(`push_data_${type}`, hash, ...args)
  const tx = await instance.send(`push_data_${type}`,[hash, ...args]);
  const confirmation = await tx.confirm(3); // wait for 3 confirmations

  return {
    txhash: confirmation.transactionHash,
    result: true
  }
}

export async function push(
  contract: string,
  hash: string,
  data: IOracleData,
  memo: string = '',
) {
  return ethPush(contract, hash, data, memo, pushDataQtum);
}
