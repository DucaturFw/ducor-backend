import { getDataDefByHash, init } from "./reverse_map"
import { hash } from "./utils/hasher"

beforeAll(async () => await init())

describe("reverse_map migration", () =>
{
})
describe("reverse_map data ids", () =>
{
	it('should return LTC/BTC', async () =>
	{
		let h = hash("crypto/binance:pair=LTC/BTC")
		expect(h).toEqual("f778e7fa5b6ece80662b34fd629efea910dc1cf6c0abef62e4bb288daeca6cfb")
		let data = await getDataDefByHash(h)
		expect(data).toBeDefined()
		expect(data.category).toEqual('crypto')
		expect(data.provider).toEqual('binance')
		expect(data.hash).toEqual(h)
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