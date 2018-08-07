import { tickerRequest, getExchanges, IProvider, getType } from './crypto'

export const providers = getExchanges().reduce((obj, key) =>
	({ ...obj, [key]: tickerRequest(key as IProvider) }), {})

export const types = {
	binance: getType
}
