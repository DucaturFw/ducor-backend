import { IDataProvider, ITypeProvider } from "../../IDataProvider"
import { IOracleData } from "../../IOracleData"

let random = (limit: number) => Math.floor(Math.random() * limit)
let randomBetween = (min: number, max: number) => min + random(max - min)
let getInteger: IDataProvider<{}, [number, number]> = (config, min, max) => Promise.resolve({ type: "int", data: randomBetween(min, max) } as IOracleData)
let getArray: IDataProvider<{}, [number, number, number]> = (config, min, max, count) =>
{
	let numbers = []
	for (let i = 0; i < count; i++)
		numbers[i] = randomBetween(min, max)
	
	return Promise.resolve({ type: "bytes", data: Buffer.from(numbers) } as IOracleData)
}
export let getData: IDataProvider<{ multi: boolean }, [number, number, number?]> = (config, min, max, count) =>
{
	if (config.multi)
		return getInteger(config, min, max)
	
	return getArray(config, min, max, count!)
}
export let getType: ITypeProvider<{ multi: boolean }> = config => config.multi
	? { type: "bytes", name: "randomBytes", args: [
		{ name: "min", type: "int" },
		{ name: "max", type: "int" },
		{ name: "count", type: "uint" }
	] }
	: { type: "int", name: "singleNumber", args: [
		{ name: "min", type: "int" },
		{ name: "max", type: "int" }
	] }