import { tickerRequest, getExchanges, IProvider } from './crypto'
import { request as fake } from './fake'

export const providers = getExchanges().reduce((obj, key) =>
	({ ...obj, [key]: tickerRequest(key as IProvider) }), { fake })

export const types = getExchanges().reduce((obj, key) =>
	({ ...obj, [key]: () => 'price' }), { fake: () => 'price' })
