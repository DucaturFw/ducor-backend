import { IContractGenerator, IContractEndpointSettings } from "../IOracleData"

export let contract: IContractGenerator = endpoints => gen(feed(endpoints))

let gen = require('./eos-js-gen.js')

let epToProv = (e: IContractEndpointSettings) =>
{
	return {
		id: `0x${e.hash}`,
		name: e.name,
		alias: e.name,
		type: e.type,
		bestBefore: e.lifetime,
		updateAfter: e.updateFreq,
	}
}

let feed = (endpoints: IContractEndpointSettings[]) => ({
	customs: [
		{
			name: "price",
			fields: [
				{ type: "uint64_t", name: "value" },
				{ type: "uint8_t", name: "decimals" }
			]
		}
	],
	providers: endpoints.map(epToProv),
	endpoint: [
		{ suffix: "uint", type: "uint64_t" },
		{ suffix: "str", type: "std::string" },
		{ suffix: "price", type: "price" }
	]
})