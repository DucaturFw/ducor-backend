import "jest-extended"

import { request as requestBitfinex } from "./bitfinex"

describe("bitfinex tests", () =>
{
	it('should have bitfinex data', async () =>
	{
		let result = await requestBitfinex("ETH/BTC")
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