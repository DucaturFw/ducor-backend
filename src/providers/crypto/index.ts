import ccxt from 'ccxt'

export type IProvider = 'bitfinex' | 'binance' | 'kraken' // TODO: fill it?

export const getExchanges = () => ccxt.exchanges

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
      price: Math.round(ticker.last as number * 1e8),
      decimals: 8,
    },
  }
}
