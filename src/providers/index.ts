import { request as fake } from "./fake"
import { request as binance } from "./crypto/binance"

export let providers = {
	fake,
	binance,
}

export { types } from "./types"