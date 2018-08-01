require('dotenv').config()

import { start as fakeRead, push as fakePush } from "./blockchains/fake"
import { start as eosRead, push as eosPush } from "./blockchains/eos"
import { RequestHandler } from "./IBlockchain"
import { getDataDefByHash } from "./reverse_map"
import { providers } from "./providers"
import { app as api, CONFIG as apiConfig } from "./api"
import { generate, config } from "./api/configurator"

console.log("hello")

let readers = [fakeRead, eosRead]
let writers = {
	fake: fakePush,
	eos: eosPush
}

let onRequest: RequestHandler = async req => {
	console.log("NEW REQUEST")
	console.log(req)
	let def = await getDataDefByHash(req.dataHash)
	if (!def)
		return console.log(`data hash not found! ${req.dataHash}`), false

	let response = await providers[def.provider as keyof typeof providers](def.ident)
	let tx = await writers[req.blockchain as keyof typeof writers](req.receiver, req.dataHash, response)
	return tx.result
}

let stoppers = readers.forEach(r => r(onRequest))

apiConfig.config = config
apiConfig.generate = generate

let PORT = process.env.DUCOR_API_PORT
api.listen(PORT, () => {
	console.log(`api listening on ${PORT}`)
})