import { start as fakeRead, push as fakePush } from "./blockchains/fake"
import { RequestHandler } from "./IBlockchain"
import { getDataDefByHash } from "./reverse_map"
import { providers } from "./providers"
import { app as api, CONFIG as apiConfig } from "./api"
import { SYMBOLS as BINANCE_SYMBOLS } from "./providers/binance";

console.log("hello")

let readers = [ fakeRead ]
let writers = {
	fake: fakePush
}

let onRequest: RequestHandler = async req =>
{
	console.log("NEW REQUEST")
	console.log(req)
	let def = await getDataDefByHash(req.dataHash)
	if (!def)
		return console.log(`data hash not found! ${req.dataHash}`), false

	let response = await providers[def.provider as keyof typeof providers](def.params)
	let tx = await writers[req.blockchain as keyof typeof writers](req.receiver, req.dataHash, response)
	return tx.result
}

let stoppers = readers.forEach(r => r(onRequest))

apiConfig.config = () => ({
	categories: [
		{
			name: "crypto",
			types: ["eth/btc", "ducat/eth", ...BINANCE_SYMBOLS],
			providers: [
				{ id: "binance", name: "Binance", types: BINANCE_SYMBOLS },
				{ id: "ducatur", name: "Ducatur Crypto", types: ["eth/btc", "ducat/eth"] }
			]
		},
		{
			name: "stocks"
		},
		{
			name: "sports"
		},
		{
			name: "random"
		}
	],
})

let PORT = 3091
api.listen(PORT, () =>
{
	console.log(`api listening on ${PORT}`)
})