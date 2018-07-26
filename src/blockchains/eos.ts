import { IContractGenerator, IContractEndpointSettings, IOracleData, IDataGeneric } from "../IOracleData"
import { IBlockchainPusher } from "../IBlockchain"
import { callContract } from "./lib"
import { IEosContract, IEosjsCallsParams } from "eosjs"

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

interface IDataArgs
{
	data_id: string
	oracle: string
	data: any
}
interface IConsumerContract extends IEosContract
{
	pushuint(args: IDataArgs, extra?: IEosjsCallsParams): Promise<void>
	pushstr(args: IDataArgs, extra?: IEosjsCallsParams): Promise<void>
	pushprice(args: IDataArgs, extra?: IEosjsCallsParams): Promise<void>
}

export let push: IBlockchainPusher<boolean> = async (receiver, dataHash, data) =>
{
	console.log(`[EOS] PUSHED DATA TO ${receiver}`)
	console.log(data)

	let result = await callContract<IConsumerContract, IDataArgs>(receiver, `push${data.type}` as keyof IConsumerContract, {
		data: data.data,
		data_id: `0x${dataHash}`,
		oracle: `unknown`
	}, { authorization: "unknown" })

	return {
		txhash: `${receiver}+${dataHash}`,
		result: true
	}
}