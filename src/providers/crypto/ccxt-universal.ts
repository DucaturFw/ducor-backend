import ccxt from 'ccxt'
import { IDataProvider, ITypeProvider } from '../../IDataProvider'
import { polyfill } from './IPairMatcher'

export function generateProvider(exchange: ccxt.Exchange)
{
	let getTicker = (pair: [string, string]) => exchange.fetchTicker(pair.join('/'))

	let canonicalToExchange = (asset: string) => asset
	let exchangeToCanonical = (asset: string) => asset

	let MARKETS: ccxt.Market[] | undefined

	let matcher = polyfill({
		listPairsExchange: async () =>
		{
			if (!MARKETS)
				MARKETS = await exchange.fetchMarkets()
			
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

	let getType: ITypeProvider<{ pair: string }> = config => ({ type: 'price', name: config.pair, args: [] })

	let request: IDataProvider<{ pair: string }, []> = async config =>
	{
		console.log(`[ccxt/${exchange.id} ${exchange.name}] REQUESTED DATA (${config}):`)

		const ticker = await exchange.fetchTicker(config.pair)
		return {
			type: 'price',
			data: {
				price: Math.round(ticker.last as number * 1e8),
				decimals: 8
			}
		}
	}
	return {
		matcher,
		getType,
		request,
		exchange
	}
}

let r = true ? undefined as never : generateProvider(undefined as any)

export type IExchangeProvider = typeof r