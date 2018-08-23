import {
  IContractGenerator,
  IContractEndpointSettings
} from "../../IOracleData"
import { IBlockchainPusher } from "../../IBlockchain"
import eosPush from "./eos-push"
import slug from "slug"
import { IDataProviderRequestArg } from "../../IDataProvider"

const argsTypes: { [type: string]: number } = {
  int: 0,
  uint: 1,
  bytes: 4,
  string: 5,
  float: 6,
  price: 6
}

const defaultArgs: { [type: number]: string } = {
  [0]: "0",
  [1]: "0u",
  [2]: "0L",
  [3]: "0UL",
  [4]: "bytes{0,0}",
  [5]: 'pack("Your string here")'
}

let gen = require("./eosgenerator.js") as (
  config: IEOSGeneratorConfiguration
) => string

export let contract: IContractGenerator = endpoints => gen(feed(endpoints))

export interface IFieldConfguration {
  type: string
  name: string
}

export interface IEndpointConfiguration {
  suffix: string
  type: string
}

export interface IDataProviderArgumentConfiguration {
  type: number
  default: string
}

export interface IDataProviderConfiguration {
  id: string
  name: string
  alias: string
  type: string
  bestBefore: number
  updateAfter: number
  args: IDataProviderArgumentConfiguration[]
}

export interface ICustomTypeConfiguration {
  name: string
  fields?: IFieldConfguration[]
}
export interface IEOSGeneratorConfiguration {
  customs?: ICustomTypeConfiguration[]
  providers?: IDataProviderConfiguration[]
}

const nameToAlias = (name: string) => {
  return slug(name, {
    lower: true,
    replacement: ""
  })
}

const nameToName = (name: string) => {
  return nameToAlias(name)
}

const toDefaultArg = (
  arg: IDataProviderRequestArg
): IDataProviderArgumentConfiguration => ({
  type: argsTypes[arg.type],
  default: defaultArgs[argsTypes[arg.type]]
})

let epToProv = (e: IContractEndpointSettings) => {
  return {
    id: e.hash,
    name: nameToName(e.name),
    alias: nameToAlias(e.name),
    type: e.type,
    bestBefore: e.lifetime,
    updateAfter: e.updateFreq,
    args: e.args.map(toDefaultArg)
  }
}

let feed = (
  endpoints: IContractEndpointSettings[]
): IEOSGeneratorConfiguration => {
  const params = {
    customs: [
      {
        name: "price",
        fields: [
          { type: "uint64_t", name: "value" },
          { type: "uint8_t", name: "decimals" }
        ]
      }
    ],
    providers: endpoints.map(epToProv)
  }
  console.log(JSON.stringify(params, null, 2))
  return params
}

export { start } from "./eos-watch"

export let push: IBlockchainPusher<boolean> = async (
  receiver,
  dataHash,
  data,
  memo
) => {
  console.log(`[EOS] PUSHED DATA TO ${receiver}`)
  console.log(data)

  return eosPush(receiver, dataHash, data, memo)
}
