export interface IDataGeneric<TType, TData>
{
	dataHash: string
	type: TType
	data: TData
}
export type IOracleData =
	| IDataGeneric<"bytes", string | Buffer>
	| IDataGeneric<"int", number>
	| IDataGeneric<"float", number>
	| IDataGeneric<"string", string>
	| IDataGeneric<"price", { price: number, decimals: number }>

export interface IDataDefinition<TProviderDataParams>
{
	hash: string
	provider: string
	params: TProviderDataParams
}