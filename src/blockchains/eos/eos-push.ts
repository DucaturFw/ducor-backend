import { IOracleData, IDataGeneric } from "../../IOracleData"
import Eos from "eosjs"
import { ITxPushResult } from "../../IBlockchain"

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
    chainId: process.env.DUCOR_EOS_CHAINID,
    keyprovider: process.env.DUCOR_EOS_ORACLE_PRIVATEKEY,
    endpoint: process.env.DUCOR_EOS_ENDPOINT
  }).contract(contract)
}

export default async function push(
  contract: string,
  hash: string,
  data: IOracleData,
  memo: string
): Promise<ITxPushResult<boolean>> {
  const instance = await getContract(contract)
  const tx = await instance[`push${data.type}`](
    process.env.DUCOR_EOS_ORACLE_ACCOUNT,
    hash,
    data.data,
    memo,
    {
      authorization: [process.env.DUCOR_EOS_ORACLE_ACCOUNT]
    }
  )

  return {
    txhash: tx.transaction_id,
    result: true
  }
}
