import { IConfigGenerateFunction } from "."
import { hashDataId } from "../utils/hasher"
import { getDataDefByHash } from "../reverse_map"
import { IContractEndpointSettings, IDataType } from "../IOracleData"
import { types } from "../providers"

import { contract as fakeContract } from "../blockchains/fake"
import { contract as eosContract } from "../blockchains/eos"
import { contract as ethContract } from "../blockchains/eth"

import configMethod, { initProviders } from './methods/config'

export let generators = {
	fake: fakeContract,
	eos: eosContract,
	eth: ethContract
}

export let generate: IConfigGenerateFunction = ({ blockchain, category, slug, lifetime, provider, updatefreq }) => {
	let type = types[provider as keyof typeof types](/*slug*/) as IDataType
	let name = slug.replace(/\W/gi, '').toLowerCase()
	let hash = hashDataId({ category, provider, ident: slug })
	if (!getDataDefByHash(hash))
		return {
			contract: "ERROR",
			instructions: `ERROR! hash "${hash}" not found!\n${blockchain}|${category}|${slug}|${provider}|${updatefreq}`
		}
	let e: IContractEndpointSettings = { name, type, lifetime: parseInt(lifetime), updateFreq: parseInt(updatefreq), hash }
	let generator = generators[blockchain as keyof typeof generators]
	if (!generator)
		return { contract: "...", instructions: "..." }

	return {
		contract: generator([e]),
		instructions: `${blockchain}_contract_instructions`
	}
}

export let makeConfig = async () => {
	const props = await initProviders()
	return configMethod(props)
}