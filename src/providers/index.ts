import { getType as getTypeBinance } from "./crypto/binance"

import { tickerRequest, getExchanges, IProvider } from './crypto'

export const providers = getExchanges().reduce((obj, key) =>
	({ ...obj, [key]: tickerRequest(key as IProvider) }), {})

export const types = {
	binance: getTypeBinance
}
