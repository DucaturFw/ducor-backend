import { IBlockchainReader } from "../../IBlockchain"
import master from "../eth/MasterOracle.json"
import { getContract, getOptions, getQtumRPC } from "./provider";
import { getConnection, getOrCreateDatabase, checkOrCreateTable, parseArgs } from "../eth/eth-watch";
import { IContractEventLog } from "qtumjs";

export const start: IBlockchainReader = async listener => {
  const options = getOptions()
  const qtumrpc = getQtumRPC(
      options.qtumProvider,
      options.oraclePublicKey,
      options.oraclePrivateKey
  )
  const masterContract = getContract(
    qtumrpc,
    master.abi,
    options.masterAddress
  )

  const emitter = masterContract.logEmitter({fromBlock: 0})

  emitter
    .on("data", async (event: IContractEventLog) => {
      const conn = await getConnection(options.rethinkHost, options.rethinkPort)
      const db = await getOrCreateDatabase(options.rethinkDB, conn)
      await checkOrCreateTable(options.rethinkTable, db, conn, {
        primary_key: "id"
      })

      const model = {
        id: event.transactionHash,
        task: event.event!.name,
        contract: event.event!.receiver,
        args: parseArgs(event.event!.params),
        memo: event.event!.memo,
        timestamp: new Date().getTime()
      }

      await db
        .table(options.rethinkTable)
        .insert([model], {
          conflict: "replace"
        })
        .run(conn)

      await conn.close()

      listener({
        dataHash: model.task,
        requestId: model.id,
        receiver: model.contract,
        blockchain: "qtum",
        timestamp: model.timestamp
      })
    })

  return {
    stop: async () => {
      console.log("stop qtum watcher")
    }
  }
}
