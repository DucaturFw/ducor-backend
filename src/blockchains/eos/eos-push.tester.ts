import push, { sell } from "./eos-push"
import * as hasher from "../../utils/hasher"
export interface IFieldConfguration {
  type: string
  name: string
}

export interface IEndpointConfiguration {
  suffix: string
  type: string
}

export interface IDataProviderConfiguration {
  id: string
  name: string
  alias: string
  type: string
  bestBefore: number
  updateAfter: number
}

export interface ICustomTypeConfiguration {
  name: string
  fields?: IFieldConfguration[]
}
export interface IEOSGeneratorConfiguration {
  customs?: ICustomTypeConfiguration[]
  providers?: IDataProviderConfiguration[]
  endpoints?: IEndpointConfiguration[]
}

const oraclized = require("./eos-js-gen") as (
  config: IEOSGeneratorConfiguration
) => string

async function exec() {
  // const code = oraclized({
  //   customs: [
  //     {
  //       name: "price",
  //       fields: [
  //         { type: "uint64_t", name: "value" },
  //         { type: "uint8_t", name: "decimals" }
  //       ]
  //     }
  //   ],
  //   providers: [
  //     {
  //       id: hasher.hashDataId({
  //         category: "crypto",
  //         provider: "binance",
  //         ident: "ETHBTC"
  //       }),
  //       name: "ethbtc",
  //       alias: "ethbtc",
  //       type: "price",
  //       bestBefore: 84600,
  //       updateAfter: 3600
  //     },
  //     {
  //       id: hasher.hashDataId({
  //         category: "crypto",
  //         provider: "binance",
  //         ident: "EOSETH"
  //       }),
  //       name: "eoseth",
  //       alias: "eoseth",
  //       type: "price",
  //       bestBefore: 84600,
  //       updateAfter: 3600
  //     }
  //   ],
  //   endpoints: [{ suffix: "price", type: "price" }]
  // })
  // console.log(code)
  // console.log(process.env.EOS_PRIVATEKEY)

  console.log("----------------------------- oraclize")
  await push(
    "priceoracliz",
    hasher.hashDataId({
      category: "crypto",
      provider: "binance",
      config: { pair: "ETHBTC" }
    }),
    {
      type: "price",
      data: {
        price: Math.floor(Math.random() * 10000 * 1e5),
        decimals: 5
      }
    }
  )

  console.log("----------------------------- oraclize")
  await push(
    "priceoracliz",
    hasher.hashDataId({
      category: "crypto",
      provider: "binance",
      config: { pair: "EOSETH" }
    }),
    {
      type: "price",
      data: {
        price: Math.floor(Math.random() * 10000 * 1e5),
        decimals: 5
      }
    }
  )
  console.log("----------------------------- sell")
  await sell("priceoracliz")
}

exec()
