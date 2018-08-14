export interface IQtumWatcherOptions {
  qtumProvider: string
  masterAddress: string
  rethinkHost: string
  rethinkPort: number
  rethinkDB: string
  rethinkTable: string
}

export interface IQtumPusherOptions extends IQtumWatcherOptions {
  oraclePrivateKey : string,
  oraclePublicKey: string
}

function assertEnv() {
  console.assert(
    process.env.DUCOR_QTUM_PROVIDER,
    "DUCOR_QTUM_PROVIDER is required"
  )
  console.assert(
    process.env.DUCOR_QTUM_MASTER_ADDRESS,
    "DUCOR_QTUM_MASTER_ADDRESS not found in .env!"
  )
  console.assert(
    process.env.DUCOR_EOS_RETHINKHOST,
    "DUCOR_EOS_RETHINKHOST not found in .env!"
  )
  console.assert(
    process.env.DUCOR_EOS_RETHINKPORT,
    "DUCOR_EOS_RETHINKPORT not found in .env!"
  )
  console.assert(
    process.env.DUCOR_QTUM_RETHINKDATABASE,
    "DUCOR_QTUM_RETHINKDATABASE not found in .env!"
  )
  console.assert(
    process.env.DUCOR_QTUM_RETHINKTABLE,
    "DUCOR_QTUM_RETHINKTABLE not found in .env!"
  )
  console.assert(
    process.env.DUCOR_QTUM_ORACLE_PRIVATEKEY,
    "DUCOR_QTUM_ORACLE_PRIVATEKEY not found in .env!"
  )
  console.assert(
    process.env.DUCOR_QTUM_ORACLE_ACCOUNT,
    "DUCOR_QTUM_ORACLE_ACCOUNT not found in .env!"
  )
}

export function getOptions(): IQtumPusherOptions {
  assertEnv()
  return {
    qtumProvider: process.env.DUCOR_QTUM_PROVIDER!,
    masterAddress: process.env.DUCOR_QTUM_MASTER_ADDRESS!,

    rethinkHost: process.env.DUCOR_EOS_RETHINKHOST!,
    rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT!),
    rethinkDB: process.env.DUCOR_QTUM_RETHINKDATABASE!,
    rethinkTable: process.env.DUCOR_QTUM_RETHINKTABLE!,

    oraclePrivateKey : process.env.DUCOR_QTUM_ORACLE_PRIVATEKEY!,
    oraclePublicKey: process.env.DUCOR_QTUM_ORACLE_ACCOUNT!
  }
}

export function getQtumRPC(provider: string, name: string, password: string) : QtumRPC {
  return new QtumRPC(`http://${name}:${password}@${provider}:3889`)
}

export function getContract(rpc: QtumRPC, abi: any[], address: string) : Contract {
  return new Contract(rpc, {abi, address});
}