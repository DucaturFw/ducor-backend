import { CONFIG, app } from "."
import { config, generate } from "./configurator"
import { Server } from "http"
import axios from "axios"

import "jest-extended"

describe('api responses', () =>
{
	const URL = `http://localhost:40789`

	let oldCfg = CONFIG.config
	let oldGen = CONFIG.generate

	let server: Server
	beforeAll(done =>
	{
		server = app.listen(40789, done)
	})
	afterAll(done =>
	{
		CONFIG.config = oldCfg
		CONFIG.generate = oldGen

		server.close(done)
	})
	it('should ping', async () =>
	{
		let res = await axios(`${URL}/time`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data.time).toBeDefined()
		expect(res.data.time).toBeNumber()
		expect(res.data.time).toBeWithin(Date.now() - 1000, Date.now() + 1000)
	})
	it('should return empty config by default', async () =>
	{
		let res = await axios(`${URL}/config`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data).toEqual({})
	})
	it('should return fake config', async () =>
	{
		CONFIG.config = () => ({ hello: "world" })

		let res = await axios(`${URL}/config`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data).toEqual({ hello: "world" })
	})
	it('should return real config', async () =>
	{
		CONFIG.config = config

		let res = await axios(`${URL}/config`)
		
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		let cfg = res.data as { categories: { name: string, types: string[], providers: { id: string, name: string, types: string[] }[] }[] }
		expect(cfg.categories).toBeArray()
		let crypto = cfg.categories.find(x => x.name == "crypto")
		expect(crypto).toBeDefined()
		crypto = crypto!
		expect(crypto.types).toBeArray()
		expect(crypto.types).toContain("ETH/BTC")
		expect(crypto.providers).toBeArray()
		let binance = crypto.providers.find(x => x.id == "binance")
		expect(binance).toBeDefined()
		binance = binance!
		expect(binance.types).toBeArray()
		expect(binance.types).toContain("ETH/BTC")
	})
	;['binance', 'bitfinex'].forEach(exch =>
	{
		;['eos', 'eth'].forEach(blockchain =>
		{
			it(`should return ${exch} contract on ${blockchain}`, async () =>
			{
				CONFIG.config = config
				CONFIG.generate = generate

				let res = await axios(`${URL}/generate/${blockchain}/crypto/${exch}/ETH%2FBTC?updatefreq=100&lifetime=1000`)
				expect(res.status).toEqual(200)
				let data = res.data
				expect(data).toContainAllKeys(['contract', 'instructions'])
				expect(data.contract).toBeString()
				expect(data.contract).not.toEqual('...')
				expect(data.contract.length).toBeGreaterThan(100)
			})
		})
	})
})