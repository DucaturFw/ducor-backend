export interface ICoin
{
	id: number
	name: string
	symbol: string
	slug: string
}
import json from "./cmc.json"
export const coins: ICoin[] = json.coins

let coinMap = coins.reduce((acc, cur) => ({...acc, [cur.symbol]: cur}), { } as { [symbol: string]: ICoin })

export let getCoin = (symbol: string) => coinMap[symbol]