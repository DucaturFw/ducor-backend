import { IContractGenerator, IContractEndpointSettings } from "../../IOracleData"
import { IBlockchainPusher } from "../../IBlockchain"
import eosPush from "./eos-push"
import slug from 'slug'

export let contract: IContractGenerator = endpoints => gen(feed(endpoints))

let gen = require("./eosgenerator.js")

const nameToAlias = (name: string) => {
  return slug(name, {
    lower: true,
    replacement: ''
  })
}

const nameToName = (name: string) => {
  return nameToAlias(name)
}

let epToProv = (e: IContractEndpointSettings) => {
  return {
    id: e.hash,
    name: nameToName(e.name),
    alias: nameToAlias(e.name),
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
  providers: endpoints.map(epToProv)
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
