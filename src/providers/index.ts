import { request as fake } from "./fake"
import { request as binance } from "./crypto/binance"
import { request as bitfinex } from "./crypto/bitfinex"
import { getArray as randomArray, getInteger as randomInt } from "./random/random"

export let providers = {
	crypto: {
		fake,
		binance,
		bitfinex,
	},
	random: {
		number: randomInt,
		array: randomArray,
	},
}

export { types } from "./types"