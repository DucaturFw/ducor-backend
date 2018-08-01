require('dotenv').config()
import { start as fakeRead, push as fakePush, contract as fakeContract } from "./blockchains/fake"
import { contract as eosContract, start as eosRead, push as eosPush } from "./blockchains/eos"
import { RequestHandler } from "./IBlockchain"
import { getDataDefByHash } from "./reverse_map"
import { providers, types } from "./providers"
import { app as api, CONFIG as apiConfig } from "./api"
import { matcher as binanceMatcher } from "./providers/crypto/binance"
import { IContractEndpointSettings } from "./IOracleData"
import { hashDataId } from "./utils/hasher"

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

let generators = {
	fake: fakeContract,
	eos: eosContract,
}

let binancePairs = binanceMatcher.listPairsCanonical().map(x => x.join('/'))

apiConfig.config = () => ({
	categories: [
		{
			name: "crypto",
			types: ["eth/btc", "ducat/eth", ...binancePairs],
			providers: [
				{ id: "binance", name: "Binance", types: binancePairs },
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

apiConfig.generate = ({ blockchain, category, slug, lifetime, provider, updatefreq }) => {
	let type = types[provider as keyof typeof types](slug)
	let name = slug.replace(/\W/gi, '').toLowerCase()
	let e: IContractEndpointSettings = { name, type, lifetime: parseInt(lifetime), updateFreq: parseInt(updatefreq), hash: hashDataId({ category, provider, ident: slug }) }
	let generator = generators[blockchain as keyof typeof generators]
	if (!generator)
		return { contract: "...", instructions: "..." }

	return {
		contract: generator([e]),
		instructions: `${blockchain}_contract_instructions`
	}
}

let PORT = process.env.DUCOR_API_PORT
api.listen(PORT, () => {
	console.log(`api listening on ${PORT}`)
})