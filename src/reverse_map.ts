import { IDataDefinition, IDataType, IDataHashSource } from "./IOracleData"
import { matcher as binanceMatcher } from "./providers/crypto/binance"
import { matcher as bitfinexMatcher } from "./providers/crypto/bitfinex"
import { matcher as hitbtcMatcher } from "./providers/crypto/hitbtc"
import { hashDataId } from "./utils/hasher"
import { IPairMatcher } from "./providers/crypto/IPairMatcher"

let dataDefinitions: { [key: string]: IDataDefinition } = {}

export async function init()
{
	let cryptoExch = async (matcher: IPairMatcher, name: string) => (await matcher.listPairsCanonical())
		.map(x => x.join('/'))
		.map(x => ({ category: "crypto", provider: name, config: { pair: x }, type: "price" as IDataType}))
		.map(x => ({ ...x, hash: hashDataId(x) }))
		.reduce((acc, cur) => ((acc[cur.hash] = cur), acc), { } as { [key: string]: IDataDefinition })
	
	let addHashes = async (matcher: IPairMatcher, name: string) =>
	{
		let hashes = await cryptoExch(matcher, name)
		console.log(`added ${Object.keys(hashes).length} hashes from ${name}`)
		return hashes
	}

	dataDefinitions = {
		...dataDefinitions,
		...await addHashes(binanceMatcher, "binance"),
		...await addHashes(bitfinexMatcher, "bitfinex"),
		...await addHashes(hitbtcMatcher, "hitbtc"),
	}
	
	let obj: IDataHashSource = { category: "random", provider: "number", config: {} }
	let hash = hashDataId(obj)
	dataDefinitions[hash] = { ...obj, type: "uint", hash }
}

export let getDataDefByHash = async (hash: string): Promise<IDataDefinition> =>
{
	return dataDefinitions[hash]
}