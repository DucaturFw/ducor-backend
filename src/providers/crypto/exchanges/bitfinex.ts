import ccxt from 'ccxt'
import { IDataProvider } from '../../../IDataProvider'
import { IDataType } from '../../../IOracleData'
import { polyfill } from '../IPairMatcher'

import json from '../binance-data.json'

let pairs = json.data.map(x => [x.baseAsset, x.quoteAsset] as [string, string])

let getTicker = (pair: [string, string]) => json.data[pairs.findIndex(x => x.join('|') == pair.join('|'))]

let canonicalToExchange = (asset: string) => (asset == 'BCH') ? 'BCC' : asset
let exchangeToCanonical = (asset: string) => (asset == 'BCC') ? 'BCH' : asset

export let matcher = polyfill({
	listPairsExchange: () => pairs,
	canonicalToExchange,
	exchangeToCanonical,
	pairToExchange: pair => getTicker(pair).symbol
})

export let getType = (str: string): IDataType => 'price'

export let request: IDataProvider = async params =>
{
  console.log(`[BITFINEX] REQUESTED DATA (${params}):`)
  
  const provider = new ccxt.bitfinex()
  const ticker = await provider.fetchTicker(params)
	return {
		type: 'price',
		data: {
			price: ticker.last as number,
			decimals: 8
		}
	}
}