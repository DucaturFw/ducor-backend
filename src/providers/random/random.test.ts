import "jest-extended"

import { _test_, getData } from "./random"

describe('random data provider', () =>
{
	it('should generate random integers 0-20', () =>
	{
		for (let i = 0; i < 1000; i++)
		{
			let rnd = _test_.random(20)
			expect(rnd).toBeWithin(0, 20)
		}
	})
	it('should generate random integers 20-40', () =>
	{
		for (let i = 0; i < 1000; i++)
		{
			let rnd = _test_.randomBetween(20, 40)
			expect(rnd).toBeWithin(20, 40)
		}
	})
	it('should be inclusive on lower boundary on random()', done =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = _test_.random(5)
			if (rnd == 0)
				return done()
		}
		done('not inclusive!')
	})
	it('should not be inclusive on upper boundary on random()', () =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = _test_.random(5)
			expect(rnd).not.toEqual(5)
		}
	})
	it('should be inclusive on lower boundary on randomBetween()', done =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = _test_.randomBetween(5, 10)
			if (rnd == 5)
				return done()
		}
		done('not inclusive!')
	})
	it('should not be inclusive on upper boundary on randomBetween()', () =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = _test_.randomBetween(5, 10)
			expect(rnd).not.toEqual(10)
		}
	})
	it('should be inclusive on lower boundary on getInteger()', async (done) =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = await _test_.getInteger({}, 5, 10)
			if (rnd.data == 5)
				return done()
		}
		done('not inclusive!')
	})
	it('should be inclusive on upper boundary on getInteger()', async (done) =>
	{
		for (let i = 0; i < 10000; i++)
		{
			let rnd = await _test_.getInteger({}, 5, 10)
			if (rnd.data == 10)
				return done()
		}
		done('not inclusive!')
	})
	it('should generate random integers 0-20 with empty config', async () =>
	{
		for (let i = 0; i < 1000; i++)
		{
			let rnd = await getData({} as any, 0, 20)
			expect(rnd.type).toEqual('int')
			expect(rnd.data).toBeNumber()
			expect(rnd.data).toBeWithin(0, 21)
		}
	})
})