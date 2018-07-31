import { getDataDefByHash } from "./reverse_map";

describe("reverse_map migration", () =>
{
	it('should migrate Binance ETH/BTC', async () =>
	{
		let ethbtcBinance = "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5"
		let data = await getDataDefByHash(ethbtcBinance)
		expect(data.type).toEqual('price')
		expect(data.provider).toEqual('binance')
		expect(data.category).toEqual('crypto')
		// expect(data.hash).toEqual() // what should be in hash? old one or new one?
		expect(data.ident).toEqual('ETH/BTC')
	})
})