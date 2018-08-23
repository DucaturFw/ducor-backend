import Web3 from "web3"
import { IBlockchainReader } from "../../IBlockchain"
import master from "./MasterOracle.json"
import r from "rethinkdb"
import { IDataProviderRequestArg } from "../../IDataProvider";

export interface IEthereumWatcherOptions {
  web3provider: string
  masterAddress: string

  rethinkHost: string
  rethinkPort: number
  rethinkDB: string
  rethinkTable: string
}

export function assertEnv() {
  console.assert(
    process.env.DUCOR_ETH_PROVIDER,
    "DUCOR_ETH_PROVIDER is required"
  )
  console.assert(
    process.env.DUCOR_EOS_RETHINKHOST,
    "DUCOR_EOS_RETHINKHOST not found in .env!"
  )
  console.assert(
    process.env.DUCOR_ETH_MASTER_ADDRESS,
    "DUCOR_ETH_MASTER_ADDRESS not found in .env!"
  )
  console.assert(
    process.env.DUCOR_EOS_RETHINKPORT,
    "DUCOR_EOS_RETHINKPORT not found in .env!"
  )
  console.assert(
    process.env.DUCOR_EOS_RETHINKDATABASE,
    "DUCOR_EOS_RETHINKDATABASE not found in .env!"
  )
  console.assert(
    process.env.DUCOR_ETH_RETHINKTABLE,
    "DUCOR_ETH_RETHINKTABLE not found in .env!"
  )
}

function getOptions(): IEthereumWatcherOptions {
  assertEnv()
  return {
    web3provider: process.env.DUCOR_ETH_PROVIDER!,
    masterAddress: process.env.DUCOR_ETH_MASTER_ADDRESS!,

    rethinkHost: process.env.DUCOR_EOS_RETHINKHOST!,
    rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT!),
    rethinkDB: process.env.DUCOR_EOS_RETHINKDATABASE!,
    rethinkTable: process.env.DUCOR_ETH_RETHINKTABLE!
  }
}

export async function getConnection(
  host: string,
  port: number
): Promise<r.Connection> {
  return r.connect({ host, port })
}

export async function getOrCreateDatabase(
  database: string,
  connection: r.Connection
): Promise<r.Db> {
  const databases = await r.dbList().run(connection)
  if (databases.indexOf(database) === -1) {
    await r.dbCreate(database).run(connection)
  }

  return r.db(database)
}

export async function checkOrCreateTable(table: string, db: r.Db, conn: r.Connection, opts?: r.TableOptions)
{
  const tables = await db.tableList().run(conn)
  if (tables.indexOf(table) === -1)
    await db.tableCreate(table, opts).run(conn)
}

export function parseArgs(args: number[], signature: IDataProviderRequestArg[]) {
  let lastIdx = 0;
  return signature.map((el) => {
      switch (el.type) {
          case "int":
          case "uint":
            return args[lastIdx++];
          case "float":
          case "price":
            return args[lastIdx++] / Math.pow(10, args[lastIdx++]);
          case "bytes":
          case "string":
            return ''+args[lastIdx++];
          default: throw new Error('Unknown type specified')
      }
  }) || []
}

export const getLastBlock = (db: r.Db, conn: r.Connection, table: string): Promise<number> =>
  db.table(table)
    .orderBy({ index: 'chronological' })
    .nth(-1)('blockNumber')
    .default(0)
    .run(conn)

async function connectToRethink(opts: IEthereumWatcherOptions): Promise<[r.Db, r.Connection]>
{
  try
  {
    console.log(`[ETH] Connectin to RethinkDB on ${opts.rethinkHost}:${opts.rethinkPort}`)
    const conn = await getConnection(opts.rethinkHost, opts.rethinkPort)
    console.log(`[ETH] Getting or creating RethinkDB database '${opts.rethinkDB}'`)
    const db = await getOrCreateDatabase(opts.rethinkDB, conn)
    console.log(`[ETH] Getting or creating RethinkDB table '${opts.rethinkTable}'`)
    await checkOrCreateTable(opts.rethinkTable, db, conn, {
      primary_key: "id"
    })
    console.log(`[ETH] Creating 'chronological' index on table '${opts.rethinkTable}'`)
    const indexes = await db.table(opts.rethinkTable).indexList().run(conn)
    if (indexes.indexOf('chronological') === -1) {
        await db.table(opts.rethinkTable)
            .indexCreate('chronological', [
                r.row('blockNumber'),
                r.row('logIndex')
            ])
            .run(conn)
        await db.table(opts.rethinkTable)
            .indexWait('chronological')
            .run(conn)
    }
    return [db, conn]
  }
  catch (err)
  {
    console.error('[ETH] Failed to connect to RethinkDB:', err)
  }
  return [undefined as any, undefined as any]
}

export const start: IBlockchainReader = async listener => {
  const options = getOptions()
  const web3 = new Web3()
  console.log('[ETH] Using provider:', options.web3provider, '; master address:', options.masterAddress)
  const eventProvider = new Web3.providers.WebsocketProvider(
    options.web3provider
  )

  web3.setProvider(eventProvider)
  await web3.eth.net.isListening()
  console.log('[ETH] Listening to web3 provider.')

  const masterContract = new web3.eth.Contract(
    master.abi,
    options.masterAddress
  )

  let [db, conn] = await connectToRethink(options)
  console.log(`[ETH] Getting last block from RethinkDB`)
  let fromBlock;
  try {
    fromBlock = await getLastBlock(db, conn, options.rethinkTable)
  } catch (err) {
    console.log('[ETH] Error while handling last block:', err)
  }
  fromBlock = fromBlock || parseInt(process.env.DUCOR_ETH_FROM_BLOCK!) || 0;
  console.log(`[ETH] Last block: ${fromBlock}`)

  console.log('[ETH] Starting watcher.')
  masterContract.events
    .allEvents({ fromBlock })
    .on("data", async event => {
      const model = {
        id: event.transactionHash,
        task: event.returnValues.name,
        contract: event.returnValues.receiver,
        args: event.returnValues.params || [],
        memo: event.returnValues.memo,
        timestamp: new Date().getTime()
      }

      if (db && conn) {
        console.log('[ETH] Inserting to RethinkDB.')
        await db
            .table(options.rethinkTable)
            .insert([model], {
                conflict: "replace"
            })
            .run(conn)

        await conn!.close()
      } else {
        console.log('[ETH] RethinkDB is not connected.')
      }

      console.log('[ETH] Pushing to listener.')
      listener({
        dataHash: model.task,
        requestId: model.id,
        receiver: model.contract,
        blockchain: "eth",
        args: model.args,
        memo: model.memo,
        timestamp: model.timestamp,
      }, parseArgs)
        .catch(err => console.error('Error while sending to listener:', err))
    })

  return {
    stop: async () => {
      console.log("[ETH] Stop watcher.")
    }
  }
}
