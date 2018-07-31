import Eos, { EosInstance } from "eosjs"
import r from "rethinkdb"

export interface ITask {
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

const OPTIONS: IEosWatchOptions = {
  delay: parseInt(process.env.DUCOR_EOS_WATCH_DELAY || "1500"),
  eos: {
    chainId:
      process.env.EOS_CHAINID ||
      "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca",
    httpEndpoint:
      process.env.EOS_ENDPOINT || "http://peer.test.alohaeos.com:8888"
  },
  masterAccount: process.env.DUCOR_EOS_MASTER_ORACLE || "ducormaster",
  rethinkHost: process.env.DUCOR_EOS_RETHINKHOST || "localhost",
  rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT || "28015"),
  rethinkDatabase: process.env.DUCOR_EOS_RETHINKDATABASE || "ducor",
  rethinkTable: process.env.DUCOR_EOS_RETHINKTABLE || "eos_requests"
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

async function loop(immediately?: boolean) {
  if (!immediately) {
    setTimeout(() => loop(true), OPTIONS.delay)
    return
  }

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
    await db.tableCreate(OPTIONS.rethinkTable, { primary_key: "id" }).run(conn)
  }

  const tasks = await getTasks(OPTIONS.eos, OPTIONS.masterAccount)
  await db
    .table(OPTIONS.rethinkTable)
    .insert(tasks, {
      conflict: "replace"
    })
    .run(conn)

  loop()
  await conn.close()
}

loop()
