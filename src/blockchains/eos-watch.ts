import { IBlockchainReader, IBlockchainPusher } from "../IBlockchain"
import Eos, { EosInstance } from "eosjs"
import r from "rethinkdb"

export interface ITask {
  id: string
  task: string
  contract: string
  timestamp: number
  active: boolean
}

export interface IEosWatchOptions {
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

console.assert(process.env.DUCOR_EOS_WATCH_DELAY, 'DUCOR_EOS_WATCH_DELAY')
console.assert(process.env.DUCOR_EOS_CHAINID, 'DUCOR_EOS_CHAINID')
console.assert(process.env.DUCOR_EOS_ENDPOINT, 'DUCOR_EOS_ENDPOINT')
console.assert(process.env.DUCOR_EOS_MASTER_ORACLE, 'DUCOR_EOS_MASTER_ORACLE')
console.assert(process.env.DUCOR_EOS_RETHINKHOST, 'DUCOR_EOS_RETHINKHOST')
console.assert(process.env.DUCOR_EOS_RETHINKPORT, 'DUCOR_EOS_RETHINKPORT')
console.assert(process.env.DUCOR_EOS_RETHINKDATABASE, 'DUCOR_EOS_RETHINKDATABASE')
console.assert(process.env.DUCOR_EOS_RETHINKTABLE, 'DUCOR_EOS_RETHINKTABLE')
const OPTIONS: IEosWatchOptions = {
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
}

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

export const start: IBlockchainReader = async listener => {
  const timer = setInterval(async () => {
    const conn = await r.connect({
      host: OPTIONS.rethinkHost,
      port: OPTIONS.rethinkPort
    })

    const databases = await r.dbList().run(conn)
    if (databases.indexOf(OPTIONS.rethinkDatabase) === -1) {
      await r.dbCreate(OPTIONS.rethinkDatabase).run(conn)
    }

    const db = r.db(OPTIONS.rethinkDatabase)
    const tables = await db.tableList().run(conn)
    if (tables.indexOf(OPTIONS.rethinkTable) === -1) {
      await db
        .tableCreate(OPTIONS.rethinkTable, { primary_key: "id" })
        .run(conn)
    }

    const tasks = await getTasks(OPTIONS.eos, OPTIONS.masterAccount)
    await db
      .table(OPTIONS.rethinkTable)
      .insert(tasks, {
        conflict: "replace"
      })
      .run(conn)

    await conn.close()

    await Promise.all(
      tasks.filter(t => t.active).map(t =>
        listener({
          dataHash: t.task,
          requestId: t.id,
          receiver: t.contract,
          blockchain: "eos",
          timestamp: new Date().getTime()
        })
      )
    )
  }, OPTIONS.delay)

  return {
    stop: async () => clearInterval(timer)
  }
}
