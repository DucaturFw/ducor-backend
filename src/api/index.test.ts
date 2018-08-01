import { CONFIG, app } from "."
import { config, generate } from "./configurator"
import { Server } from "http"
import axios from "axios"

import "jest-extended"

describe('api responses', () =>
{
	let oldCfg = CONFIG.config
	let oldGen = CONFIG.generate

	let server: Server
	beforeEach(done => server = app.listen(40789, done))
	afterEach(done =>
	{
		CONFIG.config = oldCfg
		CONFIG.generate = oldGen

		server.close(done)
	})
	it('should ping', async () =>
	{
		let res = await axios(`http://localhost:40789/time`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data.time).toBeDefined()
		expect(res.data.time).toBeNumber()
		expect(res.data.time).toBeWithin(Date.now() - 1000, Date.now() + 1000)
	})
	it('should return empty config', async () =>
	{
		let res = await axios(`http://localhost:40789/config`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data).toEqual({})
	})
	it('should return fake config', async () =>
	{
		CONFIG.config = () => ({ hello: "world" })

		let res = await axios(`http://localhost:40789/config`)
		expect(res).toBeDefined()
		expect(res.data).toBeObject()
		expect(res.data).toEqual({ hello: "world" })
	})
	it('should return real config', async () =>
	{
		CONFIG.config = config

		let res = await axios(`http://localhost:40789/config`)
		
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
})