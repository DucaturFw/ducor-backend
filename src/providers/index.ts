import ccxt from "ccxt"
import { request as fake } from "./fake"
import { getArray as randomArray, getInteger as randomInt, getType as randomType } from "./random/random"
import { generateProvider, IExchangeProvider } from "./crypto/ccxt-universal"
import { mapObject } from "../utils/map_object"

export let exchanges = [
	ccxt.binance,
	ccxt.bitfinex,
	ccxt.hitbtc,
	ccxt.bittrex,
	ccxt.theocean,
	ccxt.cex,
	ccxt.cobinhood,
	ccxt.coinbase,
	ccxt.coinmarketcap,
	ccxt.exmo,
	ccxt.gdax,
	ccxt.huobi,
	ccxt.kraken,
	ccxt.okex,
	ccxt.poloniex,
	ccxt.yobit,
].map(x => new x()).map(generateProvider)

export let exchangesMap = exchanges.reduce((acc, cur) => ((acc[cur.exchange.id] = cur), acc), { } as { [key: string]: IExchangeProvider })
export let requests = mapObject(exchangesMap, x => x.request)

export let providers = {
	crypto: Object.assign({ fake }, requests),
	random: {
		number: randomInt,
		array: randomArray,
	},
}

export let types = {
	crypto: mapObject(exchangesMap, x => x.getType),
	random: {
		simple: randomType
	}
}