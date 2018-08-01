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
})