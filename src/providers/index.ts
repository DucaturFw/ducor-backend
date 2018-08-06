import { request as binance, getType as getTypeBinance } from "./crypto/exchanges/binance"
import { request as bitfinex, getType as getTypeBitfinex } from "./crypto/exchanges/bitfinex"

export const providers = {
	binance,
	bitfinex,
}

export const types = {
	binance: getTypeBinance,
	bitfinex: getTypeBitfinex
}
