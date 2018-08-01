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
describe("reverse_map data ids", () =>
{
	it('should return LTC/BTC', async () =>
	{
		let data = await getDataDefByHash("1bed56281c12d572641e8a2436b8244d252c9e13c9d12d368fb3c02b1e0f4c63")
		expect(data.category).toEqual('crypto')
		expect(data.provider).toEqual('binance')
		expect(data.hash).toEqual('1bed56281c12d572641e8a2436b8244d252c9e13c9d12d368fb3c02b1e0f4c63')
		expect(data.type).toEqual('price')
		expect(data.ident).toEqual('LTC/BTC')
	})
})