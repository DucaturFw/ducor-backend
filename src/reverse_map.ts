import { IDataDefinition, IDataType } from "./IOracleData"
import { SYMBOLS } from "./providers/binance"
import { hashDataId } from "./utils/hasher"

let dataDefinitions = SYMBOLS
	.map(x => ({ category: "crypto", provider: "binance", ident: x, type: "price" as IDataType}))
	.map(x => ({ ...x, hash: hashDataId(x) }))
	.reduce((acc, cur) => ({ ...acc, [cur.hash]: cur }), {} as { [key: string]: IDataDefinition })

export let getDataDefByHash = async (hash: string): Promise<IDataDefinition> =>
{
	return dataDefinitions[hash]
}