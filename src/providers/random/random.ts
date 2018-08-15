import { IDataProvider } from "../../IDataProvider"
import { IOracleData } from "../../IOracleData"

let random = (limit: number) => Math.floor(Math.random() * limit)
export let getInteger: IDataProvider = ident => Promise.resolve({ type: "int", data: random(parseInt(ident)) } as IOracleData)
export let getArray: IDataProvider = ident =>
{
	let [limit, count] = ident.split(';').map(parseInt)
	let numbers = []
	for (let i = 0; i < count; i++)
		numbers[i] = random(limit)
	
	return Promise.resolve({ type: "bytes", data: Buffer.from(numbers) } as IOracleData)
}