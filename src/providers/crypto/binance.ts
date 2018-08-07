import axios from "axios"
import { IDataProvider } from "../../IDataProvider"
import { IDataType } from "../../IOracleData"
import { polyfill } from "./IPairMatcher"

import json from "./binance-data.json"

let pairs = json.data.map(x => [x.baseAsset, x.quoteAsset] as [string, string])

let getTicker = (pair: [string, string]) => json.data[pairs.findIndex(x => x.join('|') == pair.join('|'))]

let canonicalToExchange = (asset: string) => (asset == "BCH") ? "BCC" : asset
let exchangeToCanonical = (asset: string) => (asset == "BCC") ? "BCH" : asset

export let matcher = polyfill({
	listPairsExchange: async () => Promise.resolve(pairs),
	canonicalToExchange,
	exchangeToCanonical,
	pairToExchange: async pair => Promise.resolve(getTicker(pair).symbol)
})

export let getType = (str: string): IDataType => "price"

export let request: IDataProvider = async params =>
{
	console.log(`[BINANCE] REQUESTED DATA (${params}):`)
	
	let url = `https://api.binance.com/api/v3/ticker/price?symbol=${matcher.pairToExchange(params.split('/') as [string, string])}`
	let res = await axios(url)
	let data = res.data
	return {
		type: "price",
		data: {
			price: Math.round(res.data.price * 1e8),
			decimals: 8
		}
	}
}