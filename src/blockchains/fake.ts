import { IBlockchainReader, IBlockchainPusher } from "../IBlockchain"

export let start: IBlockchainReader = async listener =>
{
	let i = 0
	let timer = setInterval(() => listener({
		blockchain: "fake",
		dataHash: "0xdeadbeef",
		receiver: "fake_address",
		requestId: `${i++}`,
		timestamp: Date.now()
	}), 100)

	return {
		stop: async () => clearInterval(timer)
	}
}
export let push: IBlockchainPusher<boolean> = async (receiver, data) =>
{
	return {
		txhash: `${receiver}+${data.dataHash}`,
		result: true
	}
}