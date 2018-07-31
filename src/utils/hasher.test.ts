import * as hasher from "./hasher"

describe('keccak256 hashing', () =>
{
	it('should hash strings', () =>
	{
		expect(hasher.hash('hello')).toEqual('1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8')
		expect(hasher.hash('')).toEqual('c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
		expect(hasher.hash('   ')).toEqual('3c92d4b4d641105a12469db992bb974b21eba08e6db837283489bea4482cf6be')
	})
	it('should prepare objects', () =>
	{
		expect(hasher.prepare({ a: 1, b: 2 })).toEqual("a=1;b=2")
		expect(hasher.prepare({ b: 2, a: 1 })).toEqual("a=1;b=2")
		expect(hasher.prepare({ a: 'test ', b: 2 })).toEqual("a=test ;b=2")
		expect(hasher.prepare({ b: true, a: false })).toEqual("a=false;b=true")
		expect(hasher.prepare({ ab: 1, a: 3, b: 2 })).toEqual("a=3;ab=1;b=2")
	})
	it('should hash objects', () =>
	{
		expect(hasher.hashObj({ a: 1, b: 2 })).toEqual('84299359384e755a0e50ce87e0d4ff0d2e60ead2b9980edeb7cdf6925044d028')
	})
	it('should hash data hash sources', () =>
	{
		expect(hasher.hashDataId({ category: "crypto", provider: "binance", ident: "ETHBTC" })).toEqual('363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5')
	})
	it('should equal hash data hash sources', () =>
	{
		expect(
			hasher.hashDataId({ category: "crypto", provider: "binance", ident: "ETHBTC" })).toEqual(
			hasher.hash("crypto/binance:ETHBTC")
		)
	})
})