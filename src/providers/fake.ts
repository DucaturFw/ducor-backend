import { IDataProvider } from "../IDataProvider"

export let request: IDataProvider<{ query: string, pair: string }> = async req =>
{
	console.log("[FAKE] REQUESTED DATA:")
	console.log(req)
	return {
		dataHash: "",
		type: "price",
		data: {
			price: 215000000,
			decimals: 4
		}
	}
}