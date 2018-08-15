require('dotenv').config()

import { start as fakeRead, push as fakePush } from "./blockchains/fake"
import { start as eosRead, push as eosPush } from "./blockchains/eos"
import { start as ethRead, push as ethPush } from "./blockchains/eth"
import { RequestHandler } from "./IBlockchain"
import { getDataDefByHash } from "./reverse_map"
import { providers } from "./providers"
import { app as api, CONFIG as apiConfig } from "./api"
import { generate, makeConfig } from "./api/configurator"
import { IDataProvider } from "./IDataProvider"

console.log("hello")

let readers = [
	eosRead, 
	ethRead
]
let writers = {
	eos: eosPush,
	eth: ethPush
}

export let onRequest: RequestHandler = async req => {
	console.log("NEW REQUEST")
	console.log(req)
	let def = await getDataDefByHash(req.dataHash)
	if (!def)
		return console.log(`data hash not found! ${req.dataHash}`), false

	let category = providers[def.category as keyof typeof providers]
	let provider = category[def.provider as keyof typeof category] as IDataProvider
	let response = await provider(def.ident)
	let tx = await writers[req.blockchain as keyof typeof writers](req.receiver, req.dataHash, response, req.memo)
	return tx.result
}

let stoppers = readers.forEach(r => r(onRequest))

makeConfig().then(config =>
{
	apiConfig.config = config
	apiConfig.generate = generate

	let PORT = process.env.DUCOR_API_PORT
	api.listen(PORT, () => {
		console.log(`api listening on ${PORT}`)
	})
})
