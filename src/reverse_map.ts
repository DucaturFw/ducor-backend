import { IDataDefinition, IDataType, IDataHashSource } from "./IOracleData"
import { hashDataId } from "./utils/hasher"
import { IPairMatcher } from "./providers/crypto/IPairMatcher"
import { exchanges } from "./providers"

let dataDefinitions: { [key: string]: IDataDefinition } = { }

export async function init()
{
	if (Object.keys(dataDefinitions).length > 0)
		return Promise.resolve()

	let cryptoExch = async (matcher: IPairMatcher, name: string) => (await matcher.listPairsCanonical().catch(e => [] as [string, string][]))
		.map(x => x.join('/'))
		.map(x => ({ category: "crypto", provider: name, config: { pair: x }, type: "price" as IDataType}))
		.map(x => ({ ...x, hash: hashDataId(x) }))
		.reduce((acc, cur) => ((acc[cur.hash] = cur), acc), { } as { [key: string]: IDataDefinition })
	
	let addHashes = async (matcher: IPairMatcher, name: string) =>
	{
		let hashes = await cryptoExch(matcher, name).catch(e => ({} as { [key: string]: IDataDefinition }))
		console.log(`added ${Object.keys(hashes).length} hashes from ${name}`)
		return hashes
	}
	
	let matches = await Promise.all(exchanges.map(x => addHashes(x.matcher, x.exchange.id)))
	Object.assign(dataDefinitions, ...matches)
	
	let obj: IDataHashSource = { category: "random", provider: "simple", config: { } }
	let hash = hashDataId(obj)
	dataDefinitions[hash] = { ...obj, type: "uint", hash }
}

export let getDataDefByHash = (hash: string): IDataDefinition =>
{
	return dataDefinitions[hash]
}