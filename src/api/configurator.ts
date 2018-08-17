import { IConfigGenerateFunction, IConfigFunction } from "."
import { hashDataId } from "../utils/hasher"
import { getDataDefByHash } from "../reverse_map"
import { IContractEndpointSettings } from "../IOracleData"
import { types } from "../providers"

import { contract as fakeContract } from "../blockchains/fake"
import { contract as eosContract } from "../blockchains/eos"
import { contract as ethContract } from "../blockchains/eth"

import { matcher as binanceMatcher } from "../providers/crypto/binance"
import { matcher as bitfinexMatcher } from "../providers/crypto/bitfinex"

export let generators = {
	fake: fakeContract,
	eos: eosContract,
	eth: ethContract,
	qtum: ethContract

}

export let generate: IConfigGenerateFunction = ({ blockchain, category, config, lifetime, provider, updatefreq }) => {
	let type = types[provider as keyof typeof types](config)
	let hash = hashDataId({ category, provider, config })
	if (!getDataDefByHash(hash))
		return {
			contract: "ERROR",
			instructions: `ERROR! hash "${hash}" not found!\n${blockchain}|${category}|${config}|${provider}|${updatefreq}`
		}
	let e: IContractEndpointSettings = { ...type, lifetime: parseInt(lifetime), updateFreq: parseInt(updatefreq), hash }
	let generator = generators[blockchain as keyof typeof generators]
	if (!generator)
		return { contract: "...", instructions: "..." }

	return {
		contract: generator([e]),
		instructions: `${blockchain}_contract_instructions`
	}
}

export async function makeConfig(): Promise<IConfigFunction>
{
	let [binancePairs, bitfinexPairs] = (await Promise.all([binanceMatcher, bitfinexMatcher].map(exch => exch.listPairsCanonical())))
		.map(pairs => pairs.map(x => x.join('/')))

	let unique = (arr: string[]) => Object.keys(arr.reduce((acc, cur) => acc[cur] = acc, {} as {[key: string]: any}))

	let config: IConfigFunction = () => ({
		categories: [
			{
				name: "crypto",
				types: unique([...binancePairs, ...bitfinexPairs]),
				providers: [
					{ id: "binance", name: "Binance", types: binancePairs },
					{ id: "bitfinex", name: "Bitfinex", types: bitfinexPairs }
				]
			},
			{
				name: "stocks"
			},
			{
				name: "sports"
			},
			{
				name: "random",
				types: (() => { let arr = []; for (let i = 0; i < 10000; i++) { arr[i] = `${i}` } return arr })(),
				providers: [
					{ id: "number", name: "Single random number", types: (() => { let arr = []; for (let i = 0; i < 10000; i++) { arr[i] = `${i}` } return arr })() },
					// { id: "array", name: "Array of random numbers", types:  }
				]
			}
		],
	})
	return config
}