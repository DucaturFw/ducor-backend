import { IBlockchainReader, IBlockchainPusher } from "../IBlockchain"
import { IContractGenerator, IDataType } from "../IOracleData"
import { IDataProviderRequestArg } from "../IDataProvider"

export let start: IBlockchainReader = async listener =>
{
	let i = 0
	let timer = setInterval(() => listener({
		blockchain: "fake",
		dataHash: "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5",
		receiver: "fake_address",
		requestId: `${i++}`,
		timestamp: Date.now()
	}, parseArgs), 10000)

	return {
		stop: async () => clearInterval(timer)
	}
}
let parseArgs = (args: any[], signature: IDataProviderRequestArg[]) =>
{
	if (args.length != signature.length)
		throw `incorrect call: expected ${signature.length} args, but got ${args.length}`
	
	return args
		.map((val, i) => [val, signature[i]] as [any, IDataProviderRequestArg])
		.map(([arg, sig]) => parseArg(arg, sig.type))
}
let parseArg = (arg: any, type: IDataType) =>
{
	switch(type)
	{
		case "int":
		case "uint":
		case "float":
		case "price":
			return parseInt(arg)
		case "bytes":
		case "string":
			return arg
	}
}

export let push: IBlockchainPusher<boolean> = async (receiver, dataHash, data) =>
{
	console.log(`[FAKE] PUSHED DATA TO ${receiver}`)
	console.log(data)

	return {
		txhash: `${receiver}+${dataHash}`,
		result: true
	}
}
export let contract: IContractGenerator = endpoints => endpoints.map(x =>
	`push_${x.type}_${x.hash}(bytes value)\n{\n${[
		`DATA["${x.hash}"] = value;`,
		`last_update_${x.hash} = now();`,
	].map(s => `\t${s}`).join('\n')}}\n`
).join("\n")