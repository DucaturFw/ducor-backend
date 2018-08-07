import { IConfigGenerateFunction, IConfigFunction } from "."
import { hashDataId } from "../utils/hasher"
// import { getDataDefByHash } from "../reverse_map"
import { IContractEndpointSettings } from "../IOracleData"
import { types } from "../providers"

import { contract as fakeContract } from "../blockchains/fake"
import { contract as eosContract } from "../blockchains/eos"

// import { matcher as binanceMatcher } from "../providers/crypto"

import { getExchanges, pairsListRequest } from '../providers/crypto'

export let generators = {
	fake: fakeContract,
	eos: eosContract,
}

export let generate: IConfigGenerateFunction = ({ blockchain, category, slug, lifetime, provider, updatefreq }) => {
	let type = types[provider as keyof typeof types](slug)
	let name = slug.replace(/\W/gi, '').toLowerCase()
	let hash = hashDataId({ category, provider, ident: slug })
	// if (!getDataDefByHash(hash))
	// 	return {
	// 		contract: "ERROR",
	// 		instructions: `ERROR! hash "${hash}" not found!\n${blockchain}|${category}|${slug}|${provider}|${updatefreq}`
	// 	}
	let e: IContractEndpointSettings = { name, type, lifetime: parseInt(lifetime), updateFreq: parseInt(updatefreq), hash }
	let generator = generators[blockchain as keyof typeof generators]
	if (!generator)
		return { contract: "...", instructions: "..." }

	return {
		contract: generator([e]),
		instructions: `${blockchain}_contract_instructions`
	}
}

const zip = (arr: any[], ...arrs: any[][]) =>
	arr.map((v, i) => arrs.reduce((a, arr) => [...a, arr[i]], [v]))

const capitalizeFirstLetter = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1)

export const config: IConfigFunction = async () => {
	const providers = [ 'binance', 'bitfinex' ] // getExchanges()
	const providersPairsRequests = providers.map(pairsListRequest as (provider: string) => Promise<string[]>)
	const pairs = await Promise.all(providersPairsRequests)
	const pairsWithProviders = zip(providers, pairs)
	const allPairs = [ ...new Set(pairs.reduce((a, b) => [ ...a, ...b ], [])) ]

	return {
		categories: [
			{
				name: "crypto",
				types: allPairs,
				providers: pairsWithProviders.map(([ provider, pairs ]) => ({
					id: provider, name: capitalizeFirstLetter(provider), types: pairs
				}))
			},
			{
				name: "stocks"
			},
			{
				name: "sports"
			},
			{
				name: "random"
			}
		],
	}
}

config().then(config => console.log((config as any).categories[0]))