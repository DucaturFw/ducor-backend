import { IBlockchainReader, IBlockchainPusher } from "../IBlockchain"
import { IContractGenerator } from "../IOracleData";

export let start: IBlockchainReader = async listener =>
{
	let i = 0
	let timer = setInterval(() => listener({
		blockchain: "fake",
		dataHash: "010e039df408a241b369b79cf09e8dad50662491581e5a9d2ebeb1d1fd33f180",
		receiver: "fake_address",
		requestId: `${i++}`,
		timestamp: Date.now()
	}), 10000)

	return {
		stop: async () => clearInterval(timer)
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