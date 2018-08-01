export type IAssetConverter = (symbol: string) => string

export interface IPairMatcher
{
	listPairsCanonical(): [string, string][]
}
export interface IPairMatcherInternal
{
	listPairsExchange(): [string, string][]
	pairToExchange(pair: [string, string]): string

	canonicalToExchange: IAssetConverter
	exchangeToCanonical: IAssetConverter
}
export function listPairs(pairs: [string, string][], convert: IAssetConverter): [string, string][]
{
	return pairs.map(p => p.map(convert) as [string, string])
}

export function polyfill<T extends Partial<IPairMatcherInternal>>(matcher: T): IPairMatcher & T
{
	let obj = Object.assign({}, matcher, {
		listPairsCanonical: () => listPairs(matcher.listPairsExchange!(), matcher.exchangeToCanonical!)
	})
	return obj
}