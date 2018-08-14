import { IBlockchainReader } from "../../IBlockchain"
import master from "../eth/MasterOracle.json"
import r from "rethinkdb"
import { getContract, getOptions, getQtumRPC } from "./provider";
import { IContractEventLog } from "qtumjs";

async function getConnection(
  host: string,
  port: number
): Promise<r.Connection> {
  return r.connect({ host, port })
}

async function getOrCreateDatabase(
  database: string,
  connection: r.Connection
): Promise<r.Db> {
  const databases = await r.dbList().run(connection)
  if (databases.indexOf(database) === -1) {
    await r.dbCreate(database).run(connection)
  }

  return r.db(database)
}

async function checkOrCreateTable(
  table: string,
  db: r.Db,
  conn: r.Connection,
  opts?: r.TableOptions
) {
  const tables = await db.tableList().run(conn)
  if (tables.indexOf(table) === -1) {
    await db.tableCreate(table, opts).run(conn)
  }
}

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
