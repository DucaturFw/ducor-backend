import Web3 from "web3"
import Push from "./Push.json"
import Contract from "web3/eth/contract"
import { Provider } from "web3/providers"
import { IOracleData, IDataGeneric } from "../../IOracleData"
import { ITxPushResult } from "../../IBlockchain"
import { assertEnv as assertEnvWatcher, IEthereumWatcherOptions } from "./eth-watch";

export interface IEthereumPusherOptions extends IEthereumWatcherOptions {
  oraclePrivateKey : string,
  oraclePublicKey: string
}

function assertEnv() {
  assertEnvWatcher()
  console.assert(
    process.env.DUCOR_ETH_ORACLE_PRIVATEKEY,
    "DUCOR_ETH_ORACLE_PRIVATEKEY not found in .env!"
  )
  console.assert(
    process.env.DUCOR_ETH_ORACLE_ACCOUNT,
    "DUCOR_ETH_ORACLE_ACCOUNT not found in .env!"
  )
}

function getOptions(): IEthereumPusherOptions {
  assertEnv()
  return {
    web3provider: process.env.DUCOR_ETH_PROVIDER!,
    masterAddress: process.env.DUCOR_ETH_MASTER_ADDRESS!,

    rethinkHost: process.env.DUCOR_EOS_RETHINKHOST!,
    rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT!),
    rethinkDB: process.env.DUCOR_EOS_RETHINKDATABASE!,
    rethinkTable: process.env.DUCOR_ETH_RETHINKTABLE!,

    oraclePrivateKey : process.env.DUCOR_ETH_ORACLE_PRIVATEKEY!,
    oraclePublicKey: process.env.DUCOR_ETH_ORACLE_ACCOUNT!
  }
}

function getWSProvider(connectionString : string) : Provider {
  return new Web3.providers.WebsocketProvider(connectionString)
}

function getWeb3(web3provider : Provider, privateKey? : string) : Web3 {
  const web3 = new Web3()
  web3.setProvider(web3provider)
  if (privateKey) {
    web3.eth.accounts.wallet.add(privateKey)
  }
  return web3
}

function getContract(connection : Web3, abi: any[], address: string) : Contract{
  return new connection.eth.Contract(abi, address);
}

async function pushDataEth(receiver: string, type: string, hash: string, ...args: any[]) : Promise<ITxPushResult<boolean>> {
  const opts = getOptions();
  const web3provider = getWSProvider(opts.web3provider);
  const web3 = getWeb3(web3provider, opts.oraclePrivateKey);
  const instance = await getContract(web3, Push, receiver);
  
  console.log(`push_data_${type}`, hash, ...args)
  const request = instance.methods[`push_data_${type}`](hash, ...args);
  console.log(Object.keys(instance.methods))
  console.log(request.encodeABI())
  const tx = await request.send({
    from: opts.oraclePublicKey,
    gasPrice: 1e6,
    gas: 1e12
  })


  return {
    txhash: tx.transaction_id,
    result: true    
  }
}

async function pushPrice(
  contract: string,
  hash: string,
  data: IDataGeneric<"price", { price: number; decimals: number }>,
  memo: string = '',
  pushData: (receiver: string, type: string, hash: string, ...args: any[]) => Promise<ITxPushResult<boolean>>,
) : Promise<ITxPushResult<boolean>> {

  return pushData(contract, "price", hash, data.data.price, data.data.decimals, memo)
}

async function pushInt(
  contract: string,
  hash: string,
  data: IDataGeneric<"int", number>,
  memo: string = '',
  pushData: (receiver: string, type: string, hash: string, ...args: any[]) => Promise<ITxPushResult<boolean>>,
) : Promise<ITxPushResult<boolean>> {

  return pushData(contract, "int", hash, data.data, memo)
}

async function pushUint(
  contract: string,
  hash: string,
  data: IDataGeneric<"uint", number>,
  memo: string = '',
  pushData: (receiver: string, type: string, hash: string, ...args: any[]) => Promise<ITxPushResult<boolean>>,
) : Promise<ITxPushResult<boolean>> {

  return pushData(contract, "uint", hash, data.data, memo)
}

export async function push(
  contract: string,
  hash: string,
  data: IOracleData,
  memo: string = '',
  pushData: (receiver: string, type: string, hash: string, ...args: any[]) => Promise<ITxPushResult<boolean>> = pushDataEth,
) : Promise<ITxPushResult<boolean>> {
  switch (data.type) {
    case "price":
      return pushPrice(contract, hash, data, memo, pushData)
    case "int":
      return pushInt(contract, hash, data, memo, pushData)
    case "uint":
      return pushUint(contract, hash, data, memo, pushData)
    default:
      throw new Error("Not implemented data type: " + data.type)
  }
}
