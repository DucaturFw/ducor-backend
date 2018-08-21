import { generate } from "./configurator"
import { init } from "../reverse_map"

describe("contract generation", () =>
{
	beforeAll(async () => init(), 20000)

	it('should generate simple binance eth/btc contract', () =>
	{
		let ctr = generate({
			blockchain: "eos",
			category: "crypto",
			provider: "binance",
			config: { pair: "ETH/BTC" },
			lifetime: "100",
			updatefreq: "10",
		})
		expect(ctr).toBeDefined()
		expect(ctr.contract).toBeDefined()
		expect(ctr.contract).not.toEqual("...")
		if (ctr.contract == "ERROR")
			throw ctr.instructions
	})
	it('should error out without exchange symbol pair', () =>
	{
		let ctr = generate({
			blockchain: "eos",
			category: "crypto",
			provider: "binance",
			config: { },
			lifetime: "100",
			updatefreq: "10",
		})
		expect(ctr).toBeDefined()
		expect(ctr.contract).toBeDefined()
		expect(ctr.contract).toEqual("ERROR")
	})
	it('should generate random values', () =>
	{
		let ctr = generate({
			blockchain: "eos",
			category: "random",
			provider: "simple",
			config: { },
			lifetime: "100",
			updatefreq: "10",
		})
		expect(ctr).toBeDefined()
		expect(ctr.contract).toBeDefined()
		expect(ctr.contract).not.toEqual("...")
		if (ctr.contract == "ERROR")
			throw ctr.instructions
	})
})