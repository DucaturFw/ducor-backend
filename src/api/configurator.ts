import { IConfigGenerateFunction, IConfigFunction } from "."
import { hashDataId } from "../utils/hasher"
import { getDataDefByHash } from "../reverse_map"
import { IContractEndpointSettings } from "../IOracleData"
import { types } from "../providers"

import { contract as fakeContract } from "../blockchains/fake"
import { contract as eosContract } from "../blockchains/eos"
import { contract as ethContract } from "../blockchains/eth"

import { exchanges } from "../providers"

export let generators = {
	fake: fakeContract,
	eos: eosContract,
	eth: ethContract
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
	let providers = await Promise.all(exchanges.map(async x => ({
		id: x.exchange.id,
		name: x.exchange.name,
		types: (await x.matcher.listPairsCanonical()).map(x => x.join('/'))
	})))
	let flatten = <T>(arr: T[][]) => arr.reduce((acc, val) => acc.concat(val), [])

	let unique = (arr: string[]) => Object.keys(arr.reduce((acc, cur) => acc[cur] = acc, {} as {[key: string]: any}))

	let config: IConfigFunction = () => ({
		categories: [
			{
				name: "crypto",
				types: unique(flatten(providers.map(x => x.types))),
				providers
			},
			{
				name: "stocks"
			},
			{
				name: "sports"
			},
			{
				name: "random",
				types: ["simple", "secure", "random-org"],
				providers: [
					{ id: "number", name: "Single random number", types: ["simple", "secure", "random-org"] },
					// { id: "array", name: "Array of random numbers", types:  }
				]
			}
		],
	})
	return config
}