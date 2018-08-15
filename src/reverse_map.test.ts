import { getDataDefByHash, init } from "./reverse_map"
import { hash } from "./utils/hasher"

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
		expect(data.config).toEqual({ pair: 'ETH/BTC' })
	})
})
describe("reverse_map data ids", () =>
{
	it('should return LTC/BTC', async () =>
	{
		let data = await getDataDefByHash("f778e7fa5b6ece80662b34fd629efea910dc1cf6c0abef62e4bb288daeca6cfb")
		expect(data).toBeDefined()
		expect(data.category).toEqual('crypto')
		expect(data.provider).toEqual('binance')
		expect(data.hash).toEqual('f778e7fa5b6ece80662b34fd629efea910dc1cf6c0abef62e4bb288daeca6cfb')
		expect(data.type).toEqual('price')
		expect(data.config).toEqual({ pair: 'LTC/BTC' })
	})
	it('should return random values', async () =>
	{
		let data = await getDataDefByHash(hash("random/number:"))
		expect(data).toBeDefined()
		expect(data.category).toEqual("random")
		expect(data.provider).toEqual("number")
		expect(data.type).toEqual("uint")
		expect(data.config).toEqual({})
	})
})