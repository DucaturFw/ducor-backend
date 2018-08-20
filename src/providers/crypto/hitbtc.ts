import ccxt from 'ccxt'
import { IDataProvider, ITypeProvider } from '../../IDataProvider'
import { IDataType } from '../../IOracleData'
import { polyfill } from './IPairMatcher'

const provider = new ccxt.hitbtc()

let getTicker = (pair: [string, string]) =>
  provider.fetchTicker(pair.join('/'))

let canonicalToExchange = (asset: string) => asset
let exchangeToCanonical = (asset: string) => asset

let MARKETS: ccxt.Market[] | undefined

export let matcher = polyfill({
	listPairsExchange: async () =>
	{
		if (!MARKETS)
			MARKETS = await provider.fetchMarkets()
		
		return Promise.resolve(MARKETS.map(v => v.symbol.split('/')) as [ string, string ][])
	},
	canonicalToExchange,
	exchangeToCanonical,
	pairToExchange: async pair =>
	{
		const { symbol } = await getTicker(pair)
		return symbol
	}
})

export let getType: ITypeProvider<{ pair: string }> = config => ({ type: 'price', name: config.pair })

export let request: IDataProvider<{ pair: string }, []> = async config =>
{
  console.log(`[HITBTC] REQUESTED DATA (${config}):`)

  const ticker = await provider.fetchTicker(config.pair)
	return {
		type: 'price',
		data: {
			price: Math.round(ticker.last as number * 1e8),
			decimals: 8
		}
	}
}