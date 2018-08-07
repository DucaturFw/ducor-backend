import ccxt from 'ccxt'
import { IDataProvider } from '../../IDataProvider'
import { IDataType } from '../../IOracleData'
import { polyfill } from './IPairMatcher'

const provider = new ccxt.bitfinex()

let getTicker = (pair: [string, string]) =>
  provider.fetchTicker(pair.join('/'))

let canonicalToExchange = (asset: string) => asset
let exchangeToCanonical = (asset: string) => asset

export let matcher = polyfill({
	listPairsExchange: async () => {
    const markets = await provider.fetchMarkets()
    return markets.map(v => v.symbol.split('/')) as [ string, string ][]
  },
	canonicalToExchange,
	exchangeToCanonical,
	pairToExchange: async pair => {
    const { symbol } = await getTicker(pair)
    return symbol
  }
})

export let getType = (str: string): IDataType => 'price'

export let request: IDataProvider = async params =>
{
  console.log(`[BITFINEX] REQUESTED DATA (${params}):`)

  const ticker = await provider.fetchTicker(params)
	return {
		type: 'price',
		data: {
			price: Math.round(ticker.last as number * 1e8),
			decimals: 8
		}
	}
}