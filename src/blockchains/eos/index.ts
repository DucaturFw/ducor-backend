import { IContractGenerator, IContractEndpointSettings } from "../../IOracleData"
import { IBlockchainPusher } from "../../IBlockchain"
import eosPush from "./eos-push"

export let contract: IContractGenerator = endpoints => gen(feed(endpoints))

let gen = require("./eosgenerator.js")

let epToProv = (e: IContractEndpointSettings) => {
  return {
    id: `0x${e.hash}`,
    name: e.name,
    alias: e.name,
    type: e.type,
    bestBefore: e.lifetime,
    updateAfter: e.updateFreq
  }
}

let feed = (endpoints: IContractEndpointSettings[]) => ({
  customs: [
    {
      name: "price",
      fields: [
        { type: "uint64_t", name: "value" },
        { type: "uint8_t", name: "decimals" }
      ]
    }
  ],
  providers: endpoints.map(epToProv),
  endpoints: [
    { suffix: "uint", type: "uint64_t" },
    { suffix: "str", type: "std::string" },
    { suffix: "price", type: "price" }
  ]
})

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
