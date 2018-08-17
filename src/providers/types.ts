import { getType as fake } from "./fake"
import { getType as binance } from "./crypto/binance"
import { getType as bitfinex } from "./crypto/bitfinex"
import { ITypeProvider } from "../IDataProvider"

let _types = {
	fake,
	binance,
	bitfinex
}
export let types = _types as typeof _types & { [key: string]: ITypeProvider<any> }