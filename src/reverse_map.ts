import { IDataDefinition } from "./IOracleData"

export let getDataDefByHash = (hash: string): Promise<IDataDefinition<any>> =>
{
	return Promise.resolve({
		hash,
		provider: "fake",
		params: {
			query: "ticker",
			pair: "btcusd"
		}
	})
}