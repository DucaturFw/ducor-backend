import { IConfigGenerateFunction, IConfigFunction } from "."
import { hashDataId } from "../utils/hasher"
import { getDataDefByHash } from "../reverse_map"
import { IContractEndpointSettings } from "../IOracleData"
import { types } from "../providers"

import { contract as fakeContract } from "../blockchains/fake"
import { contract as eosContract } from "../blockchains/eos"
import { contract as ethContract } from "../blockchains/eth"

import { exchanges } from "../providers"
import { ITypeProvider } from "../IDataProvider"

export let generators = {
	fake: fakeContract,
	eos: eosContract,
	eth: ethContract,
	qtum: ethContract

}

export let generate: IConfigGenerateFunction = ({ blockchain, category, config, lifetime, provider, updatefreq }) =>
{
	let cat = types[category as keyof typeof types]
	if (!cat)
		return {
			contract: "ERROR",
			instructions: `ERROR! category "${category}" not found!\n${blockchain}|${category}|${config}|${provider}|${updatefreq}`
		}
	let getType = cat[provider as keyof typeof cat] as ITypeProvider<any>
	if (!getType)
		return {
			contract: "ERROR",
			instructions: `ERROR! provider "${provider}" not found!\n${blockchain}|${category}|${config}|${provider}|${updatefreq}`
		}
	let type = getType(config)
	let hash = hashDataId({ category, provider, config })
	if (!getDataDefByHash(hash))
		return {
			contract: "ERROR",
			instructions: `ERROR! hash "${hash}" not found!\n${blockchain}|${category}|${config}|${provider}|${updatefreq}`
		}
	let e: IContractEndpointSettings = { ...type, lifetime: parseInt(lifetime), updateFreq: parseInt(updatefreq), hash }
	let generator = generators[blockchain as keyof typeof generators]
	if (!generator)
		return { contract: "ERROR", instructions: `ERROR! generator not found for ${blockchain}\n${blockchain}|${category}|${config}|${provider}|${updatefreq}` }

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
				types: ["number", "array"],
				providers: [
					{ id: "simple", name: "Simple random number generator", types: ["number"] },
					// { id: "random-org", name: "Random numbers from random.org", types:  }
				]
			}
		],
	})
	return config
}