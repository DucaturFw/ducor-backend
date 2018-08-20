import "jest-extended"

import { providers } from "../"

describe("bitfinex tests", () =>
{
	it('should have bitfinex data', async () =>
	{
		let requestBitfinex = providers.crypto["bitfinex"]
		let result = await requestBitfinex({ pair: "ETH/BTC" })
		expect(result.type).toEqual("price")
		if (result.type != "price")
			return
		
		expect(result.data).toBeDefined()
		expect(result.data.decimals).toEqual(8)
		expect(result.data.price).toBeNumber()
		expect(result.data.price).not.toEqual(0)
		expect(result.data.price).toBeWithin(0.01 * 1e8, 0.5 * 1e8)
	})
})