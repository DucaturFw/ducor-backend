import { IDataDefinition, IDataType } from "./IOracleData"
import { matcher as binanceMatcher } from "./providers/crypto/binance"
import { matcher as bitfinexMatcher } from "./providers/crypto/bitfinex";
import { hashDataId } from "./utils/hasher"

let dataDefinitions: { [key: string]: IDataDefinition }

export async function init()
{
	dataDefinitions = (await binanceMatcher.listPairsCanonical())
		.map(x => x.join('/'))
		.map(x => ({ category: "crypto", provider: "binance", ident: x, type: "price" as IDataType}))
		.map(x => ({ ...x, hash: hashDataId(x) }))
		.reduce((acc, cur) => ({ ...acc, [cur.hash]: cur }), {} as { [key: string]: IDataDefinition })
	
	dataDefinitions["363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5"] = dataDefinitions[hashDataId({
		category: "crypto",
		ident: "ETH/BTC",
		provider: "binance"
	})]

	dataDefinitions = (await bitfinexMatcher.listPairsCanonical())
		.map(x => x.join('/'))
		.map(x => ({ category: "crypto", provider: "bitfinex", ident: x, type: "price" as IDataType}))
		.map(x => ({ ...x, hash: hashDataId(x) }))
		.reduce((acc, cur) => ({ ...acc, [cur.hash]: cur }), dataDefinitions)
	
}

export let getDataDefByHash = async (hash: string): Promise<IDataDefinition> =>
{
	return dataDefinitions[hash]
}