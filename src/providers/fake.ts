import { IDataProvider } from "../IDataProvider"
import { IDataType } from "../IOracleData"

export let getType = (params: string): IDataType => "int"

export let request: IDataProvider = async req =>
{
	console.log("[FAKE] REQUESTED DATA:")
	console.log(req)
	return {
		type: "int",
		data: 12345
	}
}