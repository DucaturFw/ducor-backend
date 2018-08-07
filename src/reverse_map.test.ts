import { getDataDefByHash, init } from "./reverse_map"

beforeAll(async () => await init())

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
		let data = await getDataDefByHash("7323b6bf968dc6181e6a8736a66f0de0fa536ed530e07a48d60a670d1084f542")
		expect(data.category).toEqual('crypto')
		expect(data.provider).toEqual('binance')
		expect(data.hash).toEqual('7323b6bf968dc6181e6a8736a66f0de0fa536ed530e07a48d60a670d1084f542')
		expect(data.type).toEqual('price')
		expect(data.ident).toEqual('LTC/BTC')
	})
})