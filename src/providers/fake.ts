import { IDataProvider, ITypeProvider } from "../IDataProvider"

export let getType: ITypeProvider<{}> = config => ({ type: "int", name: "fake_type_name" })

export let request: IDataProvider<{}, []> = async req =>
{
	console.log("[FAKE] REQUESTED DATA:")
	console.log(req)
	return {
		type: "int",
		data: 12345
	}
}