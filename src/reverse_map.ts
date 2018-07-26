import { IDataDefinition } from "./IOracleData"
import { SYMBOLS } from "./providers/binance"
import { hashDataId } from "./utils/hasher"

let dataDefinitions = SYMBOLS
	.map(x => ({ category: "crypto", provider: "binance", params: { query: "ticker", pair: x } }))
	.map(x => ({ ...x, hash: hashDataId(x) }))
	.reduce((acc, cur) => ({ ...acc, [cur.hash]: cur }), {} as { [key: string]: IDataDefinition<any> })

export let getDataDefByHash = async (hash: string): Promise<IDataDefinition<any>> =>
{
	return dataDefinitions[hash]
}