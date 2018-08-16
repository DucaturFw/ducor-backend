import { IBlockchainReader, IBlockchainPusher } from "../../IBlockchain"
import Eos, { EosInstance } from "eosjs"
import r from "rethinkdb"

export interface ITask {
  id: string
  task: string
  memo: string,
  args: string,
  contract: string
  timestamp: number
  active: boolean
}


export interface IEosWatchOptions {
  channels: string[],
  delay: number
  eos: {
    chainId: string
    httpEndpoint: string
  }
  masterAccount: string
  rethinkHost: string
  rethinkPort: number
  rethinkDatabase: string
  rethinkTable: string
}

function assertEnv() {
  console.assert(process.env.DUCOR_EOS_WATCH_DELAY, 'DUCOR_EOS_WATCH_DELAY not found in .env!')
  console.assert(process.env.DUCOR_EOS_CHAINID, 'DUCOR_EOS_CHAINID not found in .env!')
  console.assert(process.env.DUCOR_EOS_ENDPOINT, 'DUCOR_EOS_ENDPOINT not found in .env!')
  console.assert(process.env.DUCOR_EOS_MASTER_ORACLE, 'DUCOR_EOS_MASTER_ORACLE not found in .env!')
  console.assert(process.env.DUCOR_EOS_RETHINKHOST, 'DUCOR_EOS_RETHINKHOST not found in .env!')
  console.assert(process.env.DUCOR_EOS_RETHINKPORT, 'DUCOR_EOS_RETHINKPORT not found in .env!')
  console.assert(process.env.DUCOR_EOS_RETHINKDATABASE, 'DUCOR_EOS_RETHINKDATABASE not found in .env!')
  console.assert(process.env.DUCOR_EOS_RETHINKTABLE, 'DUCOR_EOS_RETHINKTABLE not found in .env!')
}

function getLogChannels(conf?: string)  : string[]{
  if (!conf) {
    return []
  }

  if (conf === '*') { 
    return ['ERR', 'WARNING', 'INFO', 'LOG']
  }

  return conf.split(',')
}

function genericLog(channel : string, message?: any, ...optionalParams: any[]) {
  const { channels } = getOptions();
  if (channels.includes(channel)) {
    console.log(`[EOS-WATCH][${channel}]: `, message, ...optionalParams)
  }
}

function log(message?: any, ...optionalParams: any[]) {
  genericLog('LOG', message, ...optionalParams);
}

function info(message?: any, ...optionalParams: any[]) {
  genericLog('INFO', message, ...optionalParams);
}

function warn(message?: any, ...optionalParams: any[]) {
  genericLog('WARNING', message, ...optionalParams);
}

function error(message?: any, ...optionalParams: any[]) {
  genericLog('ERROR', message, ...optionalParams);
}

const getOptions = (): IEosWatchOptions => (assertEnv(), {
  channels: getLogChannels(process.env.DEBUG),
  delay: parseInt(process.env.DUCOR_EOS_WATCH_DELAY!),
  eos: {
    chainId: process.env.DUCOR_EOS_CHAINID!,
    httpEndpoint: process.env.DUCOR_EOS_ENDPOINT!
  },
  masterAccount: process.env.DUCOR_EOS_MASTER_ORACLE!,
  rethinkHost: process.env.DUCOR_EOS_RETHINKHOST!,
  rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT!),
  rethinkDatabase: process.env.DUCOR_EOS_RETHINKDATABASE!,
  rethinkTable: process.env.DUCOR_EOS_RETHINKTABLE!
})

function getEos(opts: any) {
  return Eos(opts)
}

function getContract(eos: EosInstance, account: string) {
  return eos.contract(account)
}

function getTable(
  eos: EosInstance,
  code: string,
  scope: string,
  table: string
) {
  return eos.getTableRows({
    code,
    scope,
    table,
    json: "true"
  })
}
async function getTasks(eosOptions: any, master: string): Promise<ITask[]> {
  const eos = getEos(eosOptions)
  const response = await getTable(eos, master, master, "request")
  return response.rows.map<ITask>((r: any) => ({
    ...r,
    active: r.active === 1,
    id: r.task + r.contract
  }))
}

async function getConnection(opts: IEosWatchOptions): Promise<r.Connection> {
  return r.connect({
    host: opts.rethinkHost,
    port: opts.rethinkPort
  })
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
  const OPTIONS = getOptions()
  const timer = setInterval(async () => {
    let db : r.Db, conn : r.Connection, tasks : ITask[]

    try {
      conn = await getConnection(OPTIONS)
      db = await getOrCreateDatabase(OPTIONS.rethinkDatabase, conn)

      await checkOrCreateTable(OPTIONS.rethinkTable, db, conn, {
        primary_key: "id"
      })
    } catch (e) {
      error('Unexpected error in rethink connection')
      error(e)
      throw e
    }

    try {
      info(`Request tasks from contract (${OPTIONS.masterAccount}) at ${process.env.DUCOR_EOS_ENDPOINT}`)
      tasks = await getTasks(OPTIONS.eos, OPTIONS.masterAccount)
      log(`Received tasks \n`, tasks)
    } catch(e) {
      error('Unexpected error in requesting tasks')
      error(e)
      throw e
    }

    try {
      await db
        .table(OPTIONS.rethinkTable)
        .insert(tasks, {
          conflict: "replace"
        })
        .run(conn)

      await conn.close()
    } catch (e) {
      error('Unexpected error in storing tasks')
      error(e)
      throw e
    }

    try {
      await Promise.all(
        tasks.filter(t => t.active).map(t =>
          listener({
            dataHash: t.task,
            requestId: t.id,
            receiver: t.contract,
            blockchain: "eos",
            timestamp: new Date().getTime(),
            args: t.args.split(';'),
            memo: t.memo
          })
        )
      )
    } catch(e) {
      error('Unexpected error in sending tasks to providers')
      error(e)
      throw e
    }
  }, OPTIONS.delay)

  return {
    stop: async () => clearInterval(timer)
  }
}
