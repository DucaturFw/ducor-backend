import {
  IBlockchainReader,
  IBlockchainPusher,
  RequestHandler
} from "../../IBlockchain"
import Eos, { EosInstance, IEosContract } from "eosjs"
import r from "rethinkdb"
import { log, info, error, warn } from "./utils/logger"

export enum TaskMode {
  Disabled,
  Repeatable,
  Once
}

export interface ITask {
  id: string
  task: string
  memo: string
  args: string
  contract: string
  timestamp: number
  update_each: number
  mode: TaskMode
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

export interface IContext {
  options: IEosWatchOptions
  db: r.Db
  conn: r.Connection
  tasks: ITask[]
  eos: EosInstance
  now: number
}

function assertEnv<T extends keyof NodeJS.ProcessEnv>(variable: T) {
  console.assert(
    process.env[variable],
    `${variable} not found in environment variables!`
  )
}

function assertEnvs() {
  assertEnv("DUCOR_EOS_WATCH_DELAY")
  assertEnv("DUCOR_EOS_CHAINID")
  assertEnv("DUCOR_EOS_ENDPOINT")
  assertEnv("DUCOR_EOS_MASTER_ORACLE")
  assertEnv("DUCOR_EOS_RETHINKHOST")
  assertEnv("DUCOR_EOS_RETHINKPORT")
  assertEnv("DUCOR_EOS_RETHINKDATABASE")
  assertEnv("DUCOR_EOS_RETHINKTABLE")
}

const getOptions = (): IEosWatchOptions => (
  assertEnvs(),
  {
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
)

const getEos = (ctx: Partial<IContext>) => () => {
  return Eos(ctx.options!.eos)
}

const getContract = (ctx: Partial<IContext>, eos: EosInstance) => (
  account: string
) => {
  return eos.contract(account)
}

const getTable = (ctx: Partial<IContext>, eos: EosInstance) => (
  code: string,
  scope: string,
  table: string
) => {
  return eos.getTableRows({
    code,
    scope,
    table,
    json: "true"
  })
}

const getTasks = (ctx: Partial<IContext>) => async (
  master: string
): Promise<ITask[]> => {
  const eos = getEos(ctx)()
  const response = await getTable(ctx, eos)(master, master, "request")
  return response.rows.map<ITask>((r: any) => ({
    ...r,
    id: r.task + r.contract
  }))
}

const getConnection = (ctx: Partial<IContext>) => (): Promise<r.Connection> => {
  return r.connect({
    host: ctx.options!.rethinkHost,
    port: ctx.options!.rethinkPort
  })
}

const getOrCreateDatabase = (ctx: Partial<IContext>) => async (
  database: string
): Promise<r.Db> => {
  const databases = await r.dbList().run(ctx.conn!)
  if (databases.indexOf(database) === -1) {
    await r.dbCreate(database).run(ctx.conn!)
  }

  return r.db(database)
}

const checkOrCreateTable = (ctx: Partial<IContext>) => async (
  table: string,
  opts?: r.TableOptions
): Promise<void> => {
  const tables = await ctx.db!.tableList().run(ctx.conn!)
  if (tables.indexOf(table) === -1) {
    await ctx.db!.tableCreate(table, opts).run(ctx.conn!)
  }
}

export const readyTaskFilter = (ctx: IContext) => (t: ITask): boolean => {
  log("validate task", t)
  if (t.mode === 0) {
    log("inactive task")
    return false
  }

  if (ctx.now < t.timestamp + t.update_each) {
    log("too early to update", ctx.now, t.timestamp + t.update_each)
    return false
  }
  log("update", ctx.now, t.timestamp + t.update_each)

  return true
}

export const parsers: {
  [key: number]: (instance: IEosContract) => (raw: string) => [number, any]
} = {
  [0]: (instance: IEosContract) => (raw: string) => {
    return [
      8,
      instance.fc.fromBuffer("int32", Buffer.from(raw.substr(0, 8), "hex"))
    ]
  },
  [1]: (instance: IEosContract) => (raw: string) => {
    return [
      8,
      instance.fc.fromBuffer("uint32", Buffer.from(raw.substr(0, 8), "hex"))
    ]
  },
  [2]: (instance: IEosContract) => (raw: string) => {
    return [
      16,
      instance.fc.fromBuffer("int64", Buffer.from(raw.substr(0, 16), "hex"))
    ]
  },
  [3]: (instance: IEosContract) => (raw: string) => {
    return [
      16,
      instance.fc.fromBuffer("uint64", Buffer.from(raw.substr(0, 16), "hex"))
    ]
  },
  [4]: (instance: IEosContract) => (raw: string) => {
    const buffer = instance.fc.fromBuffer("bytes", Buffer.from(raw, "hex")) as Buffer

    return [
      buffer.length * 2,
      buffer
    ]
  },
  [5]: (instance: IEosContract) => (raw: string) => {
    const buffer = Buffer.from(raw, "hex")
    const terminator = buffer.findIndex(b => b === 0x0)

    const str = buffer.slice(0, terminator).toString('utf8')
    // const str = instance.fc.fromBuffer("string", Buffer.from(raw, "hex")) as string
    return [
      str.length * 2 + 2,
      str
    ]
  }
}

export const parseRequestArguments = (ctx: IContext) => async (raw : string) : Promise<any[]> => {
  const instance = await getContract(ctx, ctx.eos)(ctx.options.masterAccount)
  const requestArgs = instance.fc.fromBuffer(
    "request_args",
    Buffer.from(raw, "hex")
  ) as {
    schema: string
    args: string
  }

  log('Parsing request args structure', requestArgs)

  const args: any[] = []
  let schemaLeft = requestArgs.schema.slice(0)
  let argsLeft = requestArgs.args.slice(0)

  while (schemaLeft.length > 0) {
    log('Args: ', args)
    log('Left to parse', schemaLeft, argsLeft)
    let type = parseInt(schemaLeft.substr(0, 2), 16)
    const parseFunc = parsers[type](instance)
    const [offset, arg] = parseFunc(argsLeft)
    args.push(arg)
    argsLeft = argsLeft.slice(offset)
    schemaLeft = schemaLeft.slice(2)
  }

  return args;
}

export const taskToRequestMap = (ctx: IContext, listener: RequestHandler) => async (
  t: ITask
) => {
  log("push request", t)

  listener({
    dataHash: t.task,
    requestId: t.id,
    receiver: t.contract,
    blockchain: "eos",
    timestamp: t.timestamp,
    args: await parseRequestArguments(ctx)(t.args),
    memo: t.memo
  })
}

export async function prepareContext(): Promise<IContext> {
  let prepareContext: Partial<IContext> = {}
  prepareContext.options = getOptions()
  prepareContext.conn = await getConnection(prepareContext)()
  prepareContext.db = await getOrCreateDatabase(prepareContext)(
    prepareContext.options.rethinkDatabase
  )
  prepareContext.eos = getEos(prepareContext)()
  const blockInfo = await prepareContext.eos!.getInfo({})

  // TODO: remove GMT hardcode
  prepareContext.now =
    Math.floor(new Date(blockInfo.head_block_time).getTime() / 1000) + 10800

  await checkOrCreateTable(prepareContext)(
    prepareContext.options.rethinkTable,
    {
      primary_key: "id"
    }
  )

  return <IContext>prepareContext
}

export const start: IBlockchainReader = async listener => {
  const { delay } = getOptions()

  const timer = setInterval(async () => {
    const context = await prepareContext()

    try {
      info(
        `Request tasks from contract (${context.options.masterAccount}) at ${
          process.env.DUCOR_EOS_ENDPOINT
        }`
      )
      context.tasks = await getTasks(context)(context.options.masterAccount)
      log(`Received tasks \n`, context.tasks)
    } catch (e) {
      error("Unexpected error in requesting tasks")
      error(e)
      throw e
    }

    try {
      await context.db
        .table(context.options.rethinkTable)
        .insert(context.tasks, {
          conflict: "replace"
        })
        .run(context.conn)

      await context.conn.close()
    } catch (e) {
      error("Unexpected error in storing tasks")
      error(e)
      throw e
    }

    info("Watch eos at ", context.now)

    try {
      await Promise.all(
        context.tasks
          .filter(readyTaskFilter(context))
          .map(taskToRequestMap(context, listener))
      )
    } catch (e) {
      error("Unexpected error in sending tasks to providers")
      error(e)
      throw e
    }
  }, delay)

  return {
    stop: async () => clearInterval(timer)
  }
}
