import { IDataProvider } from "../../IDataProvider"
import { IOracleData } from "../../IOracleData"

let random = (limit: number) => Math.floor(Math.random() * limit)
let randomBetween = (min: number, max: number) => min + random(max - min)
export let getInteger: IDataProvider<{}, [number, number]> = (config, min, max) => Promise.resolve({ type: "int", data: randomBetween(min, max) } as IOracleData)
export let getArray: IDataProvider<{}, [number, number, number]> = (config, min, max, count) =>
{
	let numbers = []
	for (let i = 0; i < count; i++)
		numbers[i] = randomBetween(min, max)
	
	return Promise.resolve({ type: "bytes", data: Buffer.from(numbers) } as IOracleData)
}