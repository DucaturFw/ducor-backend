require('dotenv').config()

import { start as eosRead, push as eosPush } from "./blockchains/eos"
import { start as ethRead, push as ethPush } from "./blockchains/eth"
import { start as qtumRead, push as qtumPush } from "./blockchains/qtum"
import { RequestHandler } from "./IBlockchain"
import { getDataDefByHash, init as initReverseMap } from "./reverse_map"
import { providers, types } from "./providers"
import { app as api, CONFIG as apiConfig } from "./api"
import { generate, makeConfig } from "./api/configurator"
import { IDataProvider, ITypeProvider } from "./IDataProvider"

console.log("hello")

let readers = [
	eosRead, 
	ethRead,
	qtumRead
]
let writers = {
	eos: eosPush,
	eth: ethPush,
	qtum: qtumPush,
}

export let onRequest: RequestHandler = async (req, parseArgs) => {
	console.log("NEW REQUEST")
	console.log(req)
	let def = await getDataDefByHash(req.dataHash)
	if (!def)
		return console.log(`data hash not found! ${req.dataHash}`), false

	let category = providers[def.category as keyof typeof providers]
	let provider = category[def.provider as keyof typeof category] as IDataProvider<any, any[]>
	let typeCategory = types[def.category as keyof typeof types]
	let typeProvider = typeCategory[def.provider as keyof typeof typeCategory] as ITypeProvider<any>
	let type = typeProvider(def.config)
	let args = req.args ? parseArgs(req.args, type.args) : []
	let response = await provider(def.config, args)
	let tx = await writers[req.blockchain as keyof typeof writers](req.receiver, req.dataHash, response, req.memo)
	return tx.result
}


Promise.all([makeConfig(), initReverseMap()]).then(([config]) =>
{
	let stoppers = readers.forEach(r => r(onRequest))
	apiConfig.config = config
	apiConfig.generate = generate

	let PORT = process.env.DUCOR_API_PORT
	api.listen(PORT, () => {
		console.log(`api listening on ${PORT}`)
	})
})
