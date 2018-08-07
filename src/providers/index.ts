import { request as fake } from "./fake"
import { request as binance } from "./crypto/binance"
import { request as bitfinex } from "./crypto/bitfinex"

export let providers = {
	fake,
	binance,
	bitfinex
}

export { types } from "./types"