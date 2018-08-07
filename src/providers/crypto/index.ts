import { IDataType } from '../../IOracleData'
import ccxt from 'ccxt'

export type IProvider = 'bitfinex' | 'binance' | 'kraken' | 'okcoinusd'

export const getType = (str: string): IDataType => 'price'

export const getExchanges = () => ccxt.exchanges

export const matcher = (providerName: IProvider) => ({
  listPairsExchange: async () => {
    const provider = new ccxt[providerName]
    const markets = await provider.fetchMarkets()
    return markets.map((v) => v.symbol)
  },
  canonicalToExchange: (asset: any) => asset,
  exchangeToCanonical: (asset: any) => asset,
  pairToExchange: (pair: string[]) => pair.join('/')
})

export const pairsListRequest = async (providerName: IProvider) => {
  const provider = new ccxt[providerName]()
  const markets = await provider.fetchMarkets()
  return markets.map((v) => v.symbol)
}

export const tickerRequest = (providerName: IProvider) => async (tickerName: string) => {
  const provider = new ccxt[providerName]()
  const ticker = await provider.fetchTicker(tickerName)
  return {
    type: 'price',
    data: {
      price: ticker.last as number,
      decimals: 8,
    },
  }
}
