export type IAssetConverter = (symbol: string) => string

export interface IPairMatcher
{
	listPairsCanonical(): Promise<[string, string][]>
}
export interface IPairMatcherInternal
{
	listPairsExchange(): Promise<[string, string][]>
	pairToExchange(pair: [string, string]): Promise<string>

	canonicalToExchange: IAssetConverter
	exchangeToCanonical: IAssetConverter
}
export async function listPairs(pairs: [string, string][], convert: IAssetConverter): Promise<[string, string][]>
{
	return Promise.resolve(pairs.map(p => p.map(convert) as [string, string]))
}

export function polyfill<T extends Partial<IPairMatcherInternal>>(matcher: T): IPairMatcher & T
{
	let obj = Object.assign({}, matcher, {
		listPairsCanonical: async () => listPairs(await matcher.listPairsExchange!(), matcher.exchangeToCanonical!)
	})
	return obj
}