import { getType as fake } from "./fake"
import { getType as binance } from "./crypto/binance"
import { getType as bitfinex } from "./crypto/bitfinex"

export let types = {
	fake,
	binance,
	bitfinex
}